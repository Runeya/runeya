const {
  existsSync, mkdirSync, writeFileSync, readFileSync,
  unlinkSync,
} = require('fs');
const pathfs = require('path');
const {
  readdir, mkdir, writeFile, readFile,
  unlink,
} = require('fs/promises');
const { fdir } = require('fdir');
const PromiseB = require('bluebird');
const { sockets } = require('@runeya/common-socket-server');
const args = require('./args');
const { encrypt, decrypt, decryptFile } = require('./crypto');
const alasql = require('alasql');

module.exports = new class {
  cache = {};

  getRootPath() {
    const rootPath = pathfs.resolve(args.rootPath, '.runeya/dbs');
    if (!existsSync(rootPath)) mkdirSync(rootPath, { recursive: true });
    return rootPath;
  }

  async getDbs(namespace = '') {
    const pathToDbs = pathfs.resolve(this.getRootPath(), namespace);
    if (!existsSync(pathToDbs)) await mkdir(pathToDbs, { recursive: true });
    return (await readdir(pathToDbs)).map((id) => id.replace(pathfs.extname(id), '').replace('.encrypted', ''));
  }

  async reencrypt(oldKey, newKey) {
    const api = new fdir().withFullPaths()
      .filter((path) => path.endsWith('encrypted.json'))
      .crawl(this.getRootPath());
    await PromiseB.map(api.withPromise(), async (file) => {
      const fileEncrypted = await readFile(file, 'utf-8');
      const additionnalNonce = file.split('.runeya').pop();
      const fileDecrypted = await decrypt(fileEncrypted, { additionnalNonce, encryptionKey: oldKey });
      const fileReEncrypted = await encrypt(fileDecrypted, { additionnalNonce, encryptionKey: newKey });
      await writeFile(file, fileReEncrypted, 'utf-8');
    });
  }

  getDb(id, { encrypted, defaultData } = { encrypted: true, defaultData: {} }) {
    const getPath = async () => {
      const persistencePath = pathfs.resolve(`${this.getRootPath()}/${id}${encrypted ? '.encrypted' : ''}.json`);
      if (!existsSync(pathfs.dirname(persistencePath))) await mkdirSync(pathfs.dirname(persistencePath), { recursive: true });
      if (!existsSync(persistencePath)) {
        let defaultDB = JSON.stringify(defaultData || [], null, 2);
        if (encrypted) defaultDB = await encrypt(defaultDB, { additionnalNonce: persistencePath.split('.runeya').pop() });
        await writeFile(persistencePath, defaultDB, 'utf-8');
        this.cache[id] = defaultDB;
      }
      return persistencePath;
    };
    const table = id.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, "_");
    const read = async () => {
      if (this.cache[id]) return this.cache[id];
      const path = await getPath();
      const additionnalNonce = path.split('.runeya').pop();
      let db = readFileSync(path, 'utf-8');
      if (encrypted) {
        try {
          if (typeof db === 'string' && (
            db.includes('<<<<<<< HEAD') || 
            db.includes('=======') || 
            db.includes('>>>>>>>'))
          ) {
            db = await decryptFile(db, { additionnalNonce }, path);
          } else {
            db = await decrypt(db, { additionnalNonce })
              .catch((err) => {
                console.error(path, err);
                sockets.emit('system:wrongKey');
                throw err;
              });
          }
        } catch (err) {
          console.error(path, err);
          sockets.emit('system:wrongKey');
          throw err;
        }
      }
      this.cache[id] = JSON.parse(db);
      if (!alasql.tables[table]){
        await alasql(`CREATE TABLE ${table}`)
      }
      alasql.tables[table].data = this.cache[id];
      return this.cache[id];
    }
    const write = async (data) => {
      let db = JSON.stringify(data, null, 2);
      const path = await getPath();
      const additionnalNonce = path.split('.runeya').pop();
      if (encrypted) db = await encrypt(db, { additionnalNonce });
      writeFileSync(path, db, 'utf-8');
      this.cache[id] = data;
      if (alasql.tables[table]) {
        alasql.tables[table].data = data;
      }
    }
    const escapeQuote = (data) => {
      if (typeof data === 'string') {
        return data.replace(/'/g, "''");
      }
      return data;
    };
    const setValue = (item) => {
      if (item == null) {
        return 'NULL';
      }
      if (item instanceof Date && item.toISOString) {
        return `'${item.toISOString()}'`;
      }
      if (typeof item === 'string') {
        return `'${escapeQuote(item)}'`;
      }
      return `${item}`;
    };
    return {
      getPath,
      alasql: {
        table,
        buildUpdateQuery(data) {
          const set = []
          Object.keys(data).forEach(key => {
            set.push(`${key} = ${setValue(data[key])}`)
          })
          return set.join(', ')
        },
        read: async (sql) => {
          await read()
          return alasql.promise(sql)
        }, 
        /**
         * 
         * @param {{where?: string, orderBy?: string, limit?: number, offset?: number}} param0 
         * @returns {Promise<any[]>}
         */
        simpleSelect: async ({where, orderBy, limit, offset}) => {
          await read()
          return alasql.promise(`SELECT * FROM ${table} ${where ? `WHERE ${where}` : ''} ${orderBy ? `ORDER BY ${orderBy}` : ''} ${limit ? `LIMIT ${limit}` : ''} ${offset ? `OFFSET ${offset}` : ''}`)
        },
        /** @param {string} where */
        delete: async (where) => {
          await read()
          await alasql.promise(`DELETE FROM ${table} WHERE ${where}`)
          await write(await alasql(`select * from ${table}`))
        },
        insertOne: async (data) => {
          await read()
          await alasql.promise(`INSERT INTO ${table} VALUES ${JSON.stringify(data)}`)
          await write(await alasql(`select * from ${table}`))
        },
        write: async (sql, value) => {
          await read()
          await alasql.promise(sql, value)
          await write(await alasql(`select * from ${table}`))
        }, 
      },
      write,
      read,
      delete: async () => {
        delete this.cache[id];
        return unlink(await getPath());
      },
    };
  }
}();
