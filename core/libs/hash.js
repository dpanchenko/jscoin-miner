const crypto = require('crypto');

const calculateHash = value =>
  crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');

module.exports = {
  calculateHash,
};
