const config = require('config');
const { calculateHash } = require('./hash');

const { complexity: COMPLEXITY } = config.miner;

if (!COMPLEXITY) {
  throw new Error('Complexity is not defined');
}

const TARGET = new Array(COMPLEXITY).fill('0');
const INITIAL_NONCE = 0;

const stringifyData = data => (typeof data === 'object' ? JSON.stringify(data) : data);

const prepareBlockData = (data, nonce) => `${data}${COMPLEXITY}${nonce}`;

const calculate = (data, nonce, resolve, reject) => {
  if (nonce === Number.MAX_SAFE_INTEGER) {
    return reject();
  }
  return setTimeout(() => {
    const preparedData = prepareBlockData(stringifyData(data), nonce);
    const hash = calculateHash(preparedData);
    if (hash.indexOf(TARGET) === 0) {
      return resolve({ hash, nonce });
    }
    return calculate(data, nonce + 1, resolve, reject);
  }, 0);
};


const proofOfWork = data => new Promise((resolve, reject) => calculate(data, INITIAL_NONCE, resolve, reject));

module.exports = {
  proofOfWork,
  stringifyData,
};
