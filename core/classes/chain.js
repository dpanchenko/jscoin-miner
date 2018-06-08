const config = require('config');
const createDebug = require('debug');
const request = require('request-promise-native');
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
        value: genesisBlock,
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
  chain() {
    return this.blocks.chain().find({
      key: { $ne: 'tail' },
    }).data({ removeMeta: true }).map(({ value }) => value);
  }
  last() {
    const block = this.blocks.by('key', this.tail);
    if (block) {
      return new Block(block.value);
    }
    return null;
  }
  async add(data) {
    const lastBlock = this.last();
    if (!lastBlock) {
      return null;
    }
    const newBlock = await lastBlock.generateNextBlock(data);
    if (!newBlock) {
      return null;
    }
    this.blocks.insert({
      key: newBlock.hash,
      value: newBlock,
    });
    const tail = this.blocks.by('key', this.tailKey);
    tail.value = newBlock.hash;
    this.blocks.update(tail);
    this.tail = newBlock.hash;
    return newBlock;
  }
  async consensus(miners) {
    log('call consensus method');
    const remoteChains = await Promise.all(miners.map(miner => request(`${miner.address}/blocks`)));
    let remoteLongestChain;
    remoteChains.forEach((chain) => {
      const chainData = JSON.parse(chain);
      if (!remoteLongestChain || remoteLongestChain.blocks.length < chainData.blocks.length) {
        remoteLongestChain = chainData;
      }
    });
    if (this.chain().length >= remoteLongestChain.blocks.length) {
      log('use local chain as consistent');
      return;
    }
    log('use remote chain as consistent', remoteLongestChain);
    this.blocks.clear();
    this.blocks.insert(remoteLongestChain.blocks.map(block => ({
      key: block.hash,
      value: block,
    })));
    this.blocks.insert({
      key: 'tail',
      value: remoteLongestChain.tail,
    });
    this.tail = remoteLongestChain.tail;
  }
}

module.exports = Chain;
