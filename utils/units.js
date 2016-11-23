// Using binary units since that's what Amazon uses
const bytesConversion = {
  byte: 1,
  kb: 1024,
  mb: 1024 * 1024,
  gb: 1024 * 1024 * 1024,
  tb: 1024 * 1024 * 1024 * 1024
}

const decimalPlacesToKeep = 3;
const decimalMult = Math.pow(10, decimalPlacesToKeep);

function convertBytesToUnit(bytes, unit) {
  const unitConvertionMultiplier = bytesConversion[unit.toLowerCase()]
  if (!unitConvertionMultiplier) {
    throw new Error('Unsupported storage unit');
  }
  return Math.round(bytes / unitConvertionMultiplier * decimalMult) / decimalMult;
}

module.exports = {
  convertBytesToUnit
}
