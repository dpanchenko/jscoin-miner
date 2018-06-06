const config = require('config');
const createDebug = require('debug');
const Block = require('./block');

const log = createDebug(`${config.app.name}:classes:chain`);

class Chain {
  constructor(db) {
    if (!db) {
      throw new Error('Db not set');
    }
    this.tailKey = 'tail';
    this.blocks = null;

    this.blocks = db.getCollection('blocks');
    if (this.blocks === null) {
      log('blocks collection not exist. creating...');
      this.blocks = db.addCollection('blocks', {
        unique: ['key'],
      });
      const genesisBlock = new Block();
      this.blocks.insert({
        key: genesisBlock.hash,
        value: genesisBlock.serialize(),
      });
      this.blocks.insert({
        key: this.tailKey,
        value: genesisBlock.hash,
      });
    }
    const tail = this.blocks.by('key', this.tailKey);
    if (tail) {
      this.tail = tail.value;
    } else {
      throw new Error('Blockchain broken. Tail is not exist');
    }
  }
  get chain() {
    return this.list;
  }
  get last() {
    const block = this.blocks.by('key', this.tail);
    if (block) {
      return new Block(block.value);
    }
    return null;
  }
  add(data) {
    const lastBlock = this.last;
    if (lastBlock) {
      const newBlock = lastBlock.nextBlock(data);
      this.blocks.insert({
        key: newBlock.hash,
        value: newBlock.serialize(),
      });
      const tail = this.blocks.by('key', this.tailKey);
      tail.value = newBlock.hash;
      this.blocks.update(tail);
      this.tail = newBlock.hash;
      return newBlock;
    }
    return null;
  }
}

module.exports = Chain;
