const { launch } = require('@runeya/common-express');
const pathfs = require('path');
const ports = require('../models/ports');
const table = require('../helpers/console.table');
const args = require('../helpers/args');

module.exports = {
  async launch() {
    await launch({
      port: process.env.RUNEYA_HTTP_PORT || 0,
      controllers: () => require('../app'),
      socket: true,
      apiPrefix: '/',
      bodyLimit: '100mb',
      noGreetings: true,
      staticController: process.env.NODE_ENV !== 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' ? pathfs.resolve(__dirname, 'public') : undefined,
      helmetConf: process.env.NODE_ENV !== 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' ? {
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
          directives: {
            upgradeInsecureRequests: null,
            'frame-src': ["'self'", 'docs.runeya.dev','runeya.dev', 'jsoncrack.com'],
            'worker-src': ["'self'", 'blob:'],
          },
          useDefaults: true,
        },
      } : null,
      afterControllers({ server, app }) {
        if (process.env.NODE_ENV === 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ') {
          const createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware;
          app.use('/', createProxyMiddleware({
            target: 'http://127.0.0.1:5173',
            changeOrigin: false,
            ws: true,
          }));
          server.on('upgrade', (req, res) => {
            if (req.url === '/') {
              proxy.ws(req, res, {
                target: 'ws://127.0.0.1:5173',
              });
            }
          });
        }
      },
      onListening({ server }) {
        const addr = server.address();
        const port = typeof addr === 'string'
          ? addr
          : addr?.port;
        ports.setHttpPort(+(port || 0));
        if (process.env.NODE_ENV !== 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' && !process.versions.electron && process.env.RUNEYA_DISABLE_OPEN_ON_START !== 'true') {
          require('open')(`http://localhost:${port}`);
        }
        // Tips
        (() => {
          table([
            { '': 'Version', Value: require('../helpers/version').version, 'Overrided By': '-' },
            { '': 'Port', Value: ports.http, 'Overrided By': 'RUNEYA_HTTP_PORT' },
            { '': 'Url', Value: `http://localhost:${ports.http}`, 'Overrided By': '-' },
            ...args.ss.length
              ? [{ '': 'Services', Value: args.ss.join(', '), 'Overrided By': '-' }]
              : [],
          ]);
        })();
      },
    });
    await require('../models/stack').selectConf();
  },
};
