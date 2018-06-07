const config = require('config');
const sha256hash = require('./hash');

const { complexity: COMPLEXITY } = config.miner;

if (!COMPLEXITY) {
  throw new Error('Complexity is not defined');
}

const TARGET = new Array(COMPLEXITY).fill('0');
const INITIAL_NONCE = 0;

const stringifyData = data => (typeof data === 'object' ? JSON.stringify(data) : data);

const calculateHash = (params) => {
  const {
    index = '',
    timestamp = '',
    data = '',
    previousHash = '',
    nonce = 0,
  } = params || {};
  const value = `${index}${timestamp}${stringifyData(data)}${previousHash}${nonce}${COMPLEXITY}`;
  return sha256hash(value);
};

const validateBlock = blockData =>
  blockData.hash === calculateHash(blockData);

const checkHashWithTarget = hash => hash.indexOf(TARGET) === 0;

const calculate = (blockData, nonce, resolve) =>
  setTimeout(() => {
    const hash = calculateHash({
      ...blockData,
      nonce,
    });
    if (checkHashWithTarget(hash)) {
      return resolve({ hash, nonce });
    }
    return calculate(blockData, nonce + 1, resolve);
  }, 0);

const proofOfWork = blockData =>
  new Promise(resolve =>
    calculate(blockData, INITIAL_NONCE, resolve));

module.exports = {
  checkHashWithTarget,
  stringifyData,
  calculateHash,
  validateBlock,
  proofOfWork,
};
