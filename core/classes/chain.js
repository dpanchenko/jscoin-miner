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
    return this.blocks.chain().data({ removeMeta: true });
  }
  get last() {
    const block = this.blocks.by('key', this.tail);
    if (block) {
      return new Block(JSON.parse(block.value));
    }
    return null;
  }
  async add(data) {
    const lastBlock = this.last;
    if (!lastBlock) {
      return null;
    }
    const newBlock = await lastBlock.generateNextBlock(data);
    if (!newBlock) {
      return null;
    }
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
}

module.exports = Chain;
