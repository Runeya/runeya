const { launch } = require('@runeya/common-express');
const pathfs = require('path');
const mongoose = require('mongoose');
const { auth, express: authExpress } = require('../auth/auth');

module.exports = {
  async launch() {
    await launch({
      port: process.env.PORT || 0,
      controllers: () => require('../app'),
      apiPrefix: '/api',
      bodyLimit: '100mb',
      // staticController: process.env.NODE_ENV !== 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' ? pathfs.resolve(__dirname, 'public') : pathfs.resolve(__dirname, '../public') ,
      helmetConf: process.env.NODE_ENV !== 'HFBXdZMJxLyJoua28asEaxRixJ6LriR7FnRzX6pwA7pFjZ' ? {
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: {
          directives: {
            upgradeInsecureRequests: null,
            'frame-src': ["'self'", 'docs.runeya.dev', 'jsoncrack.com'],
          },
          useDefaults: true,
        },
      } : null,
      corsConf: {
        methods: ["GET", "POST", "PUT", "DELETE"],
        origin: ['https://runeya.dev', 'https://www.runeya.dev', 'http://localhost:5555'],
        credentials: true,
      },
      authApi: authExpress,
      async beforeAll({app, server}) {
        const { mongo } = require('@runeya/common-mongo');
        await mongo.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}?authSource=admin`, '', 'runeya');
        mongoose.set('strictQuery', false);
        await mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/runeya?authSource=admin`);
        console.log('Mongoose connected successfully');

        const { mailer } = require('@runeya/common-mailer');
        if(!process.env.SMTP_HOST) {  
          throw new Error('SMTP_HOST must be set');
        }
        if(!process.env.SMTP_PORT) {
          throw new Error('SMTP_PORT must be set');
        }
        if(!process.env.SMTP_USER) {
          throw new Error('SMTP_USER must be set');
        }
        if(!process.env.SMTP_PASSWORD) {
          throw new Error('SMTP_PASSWORD must be set');
        }
        mailer.connect({
          smtpHost: process.env.SMTP_HOST || '',
          smtpPort: process.env.SMTP_PORT || '',
          user: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASSWORD || '',
        });
        console.log('Mailer connected successfully');
      }
    });
  },
};
