const crypto = require("crypto");

module.exports.askUiFor = async function(label, data, RED) {
  const {sockets} = RED.settings.functionGlobalContext.runeya
  return new Promise(resolve => {
    const uuid = crypto.randomUUID();
    sockets.emit('node-red-' + label, {
      respondTo: uuid, data: data
    })
    const cb = (data) => {
      sockets.off(cb)
      resolve(data)
    }
    sockets.on(uuid, cb)
  })
}
