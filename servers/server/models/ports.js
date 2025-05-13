module.exports = {
  http: process.env.RUNEYA_HTTP_PORT || 0,
  /** @param {number} port */
  setHttpPort(port) {
    if (!this.http) this.http = port;
  },
};
