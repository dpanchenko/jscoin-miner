const config = require('config');
const { calculateHash } = require('../libs/hash');
const { proofOfWork, stringifyData } = require('../libs/pow');

const { complexity: COMPLEXITY } = config.miner;

class Block {
  constructor(params) {
    const {
      index = 0,
      data = 'genesis',
      previousHash = '',
      timestamp = Date.now(),
      nonce = 0,
      hash,
    } = params || {};
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.nonce = nonce;
    this.previousHash = previousHash;
    this.hash = hash || this.calculateHash();
  }
  calculateHash() {
    const { index, timestamp, previousHash, nonce } = this;
    const data = stringifyData({ index, timestamp, previousHash, nonce });
    return calculateHash(`${index}${timestamp}${data}${previousHash}${COMPLEXITY}${nonce}`);
  }
  async nextBlock(data) {
    const { index, hash } = this;
    const newBlockData = {
      data: stringifyData(data),
      index: index + 1,
      previousHash: hash,
      timestamp: Date.now(),
    };
    const proof = await proofOfWork(newBlockData);

    if (!proof) {
      return null;
    }

    return new Block({
      ...newBlockData,
      ...proof,
    });
  }
  serialize() {
    const { index, timestamp, data, previousHash, nonce, hash } = this;
    return JSON.stringify({ index, timestamp, data, previousHash, nonce, hash });
  }
}

module.exports = Block;
