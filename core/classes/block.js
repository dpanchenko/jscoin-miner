const { proofOfWork, stringifyData, calculateHash } = require('../libs/pow');

class Block {
  constructor(params) {
    const {
      index = 0,
      timestamp = Date.now(),
      data = {},
      previousHash = '',
      nonce = 0,
      hash,
    } = params || {};
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.nonce = nonce;
    this.previousHash = previousHash;
    this.hash = hash || calculateHash(this);
  }
  async generateNextBlock(data) {
    const { index, hash } = this;
    const blockData = {
      index: index + 1,
      timestamp: Date.now(),
      data,
      previousHash: hash,
    };
    const proof = await proofOfWork(blockData);

    if (!proof) {
      return null;
    }

    return new Block({
      ...blockData,
      ...proof,
    });
  }
  serialize() {
    const { index, timestamp, data, previousHash, nonce, hash } = this;
    return stringifyData({ index, timestamp, data, previousHash, nonce, hash });
  }
}

module.exports = Block;
