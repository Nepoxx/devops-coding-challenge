// Using binary units since that's what Amazon uses
const bytesConversion = {
  byte: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024
}

function convertBytesToUnit(bytes, unit) {
  return Math.round(bytes / bytesConversion[unit.toLowerCase()] * 1000) / 1000;
}

module.exports = {
  convertBytesToUnit
}
