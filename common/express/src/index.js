require('express-async-errors');
const express = require('express');
const cors = require('cors');
const pathfs = require('path');
const fs = require('fs');
const healthCheck = require('@runeya/common-express-health-check');
const helmet = require('helmet').default;
const cookieParser = require('cookie-parser');
const compression = require('compression');
const http = require('http');
const Socket = require('@runeya/common-socket-server');
const CustomObservable = require('@runeya/common-socket-server/src/CustomObservable');

const onServerLaunch = new CustomObservable()
let _server
require('express-async-errors');

module.exports = {
  onServerLaunch, 
  getServer: () => {
    return new Promise((res) => {
      if(_server) return res(_server)
      onServerLaunch.subscribe(() => {
        res(_server)
      })
    })
  },
  /**
   * @param {{
   *  port: number | string,
   *  baseUrl?: string,
   *  helmetConf?: import('helmet').HelmetOptions | null,
   *  corsConf?: import('cors').CorsOptions,
   *  authApi?: (app: import('express').Express) => any,
   *  beforeAll?: ({app, server}) => any,
   *  afterAll?: () => any,
   *  socket?: boolean,
   *  onListening?: (server: {server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>, app: import('express').Express}) => any,
   *  beforeStatic?: (server: {server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>, app: import('express').Express}) => any,
   *  afterControllers?: (server: {server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>, app: import('express').Express}) => any,
   *  controllers?: () => import('express').RequestHandler,
   *  staticController?: string,
   *  noGreetings?: boolean,
   *  apiPrefix?: string
   *  bodyLimit?: string
   *  healthPath?: string
   * }} param0
   * @returns
   */
  async launch({
    port = process.env.PORT || 4002,
    baseUrl = __dirname,
    helmetConf = {},
    corsConf = {},
    beforeAll = () => {},
    afterAll = () => {},
    onListening = () => { },
    beforeStatic = () => { },
    afterControllers = () => { },
    controllers = () => () => {},
    staticController = undefined,
    noGreetings = false,
    socket = false,
    apiPrefix = '/api',
    bodyLimit = '50mb',
    healthPath = apiPrefix,
    authApi = (app) => {},
  }) {
    const pkgJSONPath = pathfs.resolve(baseUrl, 'package.json');
    const isPkgJSONExists = fs.existsSync(pkgJSONPath);
    const pkgJSON = isPkgJSONExists ? require(pkgJSONPath) : { name: 'unknown', version: 'unknown' };
    const appVersion = pkgJSON.version;
    const appName = pkgJSON.name;

    console.log(`<h2 style="background: linear-gradient(90deg, rgba(52,70,91,1) 0%, rgba(28,92,227,1) 100%);color:white;border-radius:10px;padding:10px;width: max-content">${appName.replace('@runeya/', '')}</h2>`);
    console.log(`v${appVersion} started, listening on port ${port}.`);

    const app = express();
    const server = http.createServer(app);
    if (helmetConf) {
      app.use((req, res, next) => {
        if(req.url.startsWith('/red')) return next()
        helmet(
          helmetConf
        )(req, res, next)
      });
    }

    console.log('Enable cors...');
    app.use(cors(corsConf));
    await authApi(app);

    app.options('*', (req, res, next) => {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    });

    console.log('Enable JSON body...');
    app.use(express.json({ limit: bodyLimit }));
    app.use(express.urlencoded({ extended: true }));

    console.log('Enable Cookie parser...');
    app.use(cookieParser());

    console.log('Enable Compression...');
    app.use(compression());

    console.log('Enable health check...');
    app.use(healthPath, healthCheck(express, { name: appName, version: appVersion }));

    beforeStatic?.({ server, app });

    console.log('Apply additional routes...');
    if (staticController) {
      app.use('/', express.static(staticController));
    }

    if (socket) {
      console.log('Enable socket...');
      Socket.sockets.connect(server);
    }
    app.use(apiPrefix, controllers());

    if (!noGreetings) {
      app.get('/', (req, res) => res.json({ appName, appVersion }));
    }

    afterControllers?.({ server, app });
    console.log('Enable error handling...');
    app.use(require('@runeya/common-express-error-handler')());

    console.log('Enable 404 handling...');
    app.use(require('@runeya/common-express-404'));

    console.log('Apply additional tasks before launch...');
    await beforeAll({ app, server });

    console.log('Launch...');
    server.on('listening', () => onListening({ server, app }));

    server.listen(port, async () => {
      _server = server
      onServerLaunch.next({ server, app })
      console.log('<h1>✓ Launched</h1>');
    });
    server.on('close', async () => {
      await afterAll();
    });

    return server;
  },
  express,
};
