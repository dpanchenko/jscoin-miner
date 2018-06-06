const { calculateHash } = require('../libs/hash');

class Block {
  constructor(params) {
    const {
      index = 0,
      data = 'genesis',
      previousHash = 0,
    } = params || {};
    this.index = index;
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }
  getDataStr() {
    const { data } = this;
    return typeof data === 'object' ? JSON.stringify(data) : data;
  }
  calculateHash() {
    const { index, timestamp, previousHash } = this;
    const data = this.getDataStr();
    return calculateHash(`${index}${timestamp}${data}${previousHash}`);
  }
  nextBlock(data) {
    const { index, hash } = this;
    return new Block({
      data,
      index: index + 1,
      previousHash: hash,
    });
  }
}

module.exports = Block;
