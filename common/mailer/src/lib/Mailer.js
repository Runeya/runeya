const NodeMailer = require('nodemailer');
const Mustache = require('mustache');

/**
 * @typedef {Object} SendContent
 * @property {{name: string, email: string}} from
 * @property {string} to
 * @property {string} subject
 * @property {string} html
 * @property {Object} data
 */

class Mailer {
  /**
   * @param {{smtpHost: string, smtpPort: string, user: string, password: string}} config
   */
  connect(config) {
    this.mt = NodeMailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  /**
   * @param {SendContent} config
   */
  async sendFromHtml(config) {
    if (config.data && config.html) {
      config.html = Mustache.render(config?.html, config.data);
      config.subject = Mustache.render(config.subject, config.data);
      delete config.data;
    }
    if (!this.mt) throw new Error('Mailer must be initialized');
    return this.mt.sendMail({
      ...config,
      from: {
        name: (typeof config.from === 'string' ? config.from : config.from?.name) || 'Runeya',
        address: (typeof config.from === 'string' ? config.from : config.from?.email) || 'contact@runeya.dev',
      },
      to: Array.isArray(config.to)
        ? config.to.map((to) => ({ address: to, name: to }))
        : { address: config.to, name: config.to },
    });
  }
}

module.exports = {
  mailer: new Mailer(),
  Mailer,
};
