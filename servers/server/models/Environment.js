const PromiseB = require('bluebird');
const { cloneDeep, merge, over } = require('lodash');
const dbs = require('../helpers/dbs');
const { existsSync } = require('fs');

class Environment {
  /**
   * @param {import('@runeya/common-typings').NonFunctionProperties<Environment>} environment
   */
  constructor(environment) {
    /** @type {string} */
    this.label = environment.label || '';
    /** @type {boolean} */
    this.default = environment.default || false;
    /** @type {string} */
    this.color = environment.color || '';
    /** @type {string} */
    this.bgColor = environment.bgColor || '';
    /** @type {{[key: string]: string}} */
    this.envs = environment.envs || {};
    /** @type {string[]} */
    this.extends = environment.extends || [];
    /** @type {{[key: string]: string}} */
    this.overrideEnvs = environment.overrideEnvs || {};
  }

  static async load(label, Stack) {
    const environmentDB = await dbs.getDb(`envs/${label}`).read();
    const overridesDB = dbs.getDb(`overrides/${label}-environment`)
    if(!existsSync(await overridesDB.getPath())) await new Environment(environmentDB).save()
    const overrides = await dbs.getDb(`overrides/${label}-environment`).read();

    // Ensure there is no overrides in the environmentDB
    let shouldMigrateOverrides = false;
    Object.keys(environmentDB?.envs || {}).forEach((key) => {
      if (key.endsWith('_STACK_MONITOR_OVERRIDE')) {
        shouldMigrateOverrides = true;
        overrides.envs[key.replace('_STACK_MONITOR_OVERRIDE', '_RUNEYA_OVERRIDE')] = environmentDB.envs[key];
        delete environmentDB.envs[key];
      }
      if (key.endsWith('_RUNEYA_OVERRIDE')) {
        shouldMigrateOverrides = true;
        overrides.envs[key] = environmentDB.envs[key];
        delete environmentDB.envs[key];
      }
    });


    merge(environmentDB?.envs || {}, overrides?.envs || {});
    
    const env = new Environment(environmentDB, Stack);

    if(shouldMigrateOverrides) {
      await env.save();
    }
    return env;
  }

  static async all() {
    const allDbds = await dbs.getDbs('envs');

    const environments = await PromiseB.map(allDbds, (id) => Environment.load(id));
    if (!environments.length) {
      const localEnv = new Environment({
        bgColor: '#FFFFFF',
        color: '#000000',
        default: true,
        label: 'Local',
        envs: {},
      });
      await localEnv.save();
      environments.push(localEnv);
    }
    return environments;
  }

  static async find(envLabel) {
    const envs = await this.all();
    return envs.find((env) => env.label === envLabel);
  }

  /** @returns {Promise<Environment[]>} */
  async getExtendedEnvironments() {
    return [
      this,
      ...await PromiseB
        .mapSeries(this.extends || [], (environmentLabel) =>  Environment.find(environmentLabel))
        .filter(a => !!a)
    ]
  }
  async getBank() {
    const bank = {}
    const environments = await this.getExtendedEnvironments()
    await PromiseB.map(environments.reverse(), async environment => {
      Object.assign(bank, environment?.envs)
    })
    Object.assign(bank, this.envs)
    return bank
  }

  async save() {
    const dbToWrite = this.toStorage();
    const overrideDbToWrite = { envs: {} };
    Object.keys(dbToWrite.envs).forEach((key) => {
      if (key.endsWith('_RUNEYA_OVERRIDE')) {
        overrideDbToWrite.envs[key] = dbToWrite.envs[key];
        delete dbToWrite.envs[key];
      }
    });
    await dbs.getDb(`overrides/${this.label}-environment`).write(overrideDbToWrite);
    await dbs.getDb(`envs/${this.label}`).write(dbToWrite);
  }

  async update(env) {
    this.default = env.default;
    this.color = env.color;
    this.bgColor = env.bgColor;
    this.envs = env.envs;
    this.extends = env.extends;
    return this.save();
  }

  async delete() {
    await dbs.getDb(`envs/${this.label}`).delete();
  }

  toStorage() {
    return cloneDeep({
      label: this.label,
      default: this.default,
      color: this.color,
      bgColor: this.bgColor,
      extends: this.extends,
      envs: this.envs,
    });
  }
}

module.exports = Environment;
