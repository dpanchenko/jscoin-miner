const Block = require('./block');

class Chain {
  constructor() {
    this.list = [new Block()];
  }
  get chain() {
    return this.list;
  }
  get last() {
    return this.list[this.list.length - 1];
  }
  add(data) {
    const lastBlock = this.list[this.list.length - 1];
    const newBlock = lastBlock.nextBlock(data);
    this.list.push(newBlock);
    return newBlock;
  }
}

module.exports = Chain;
