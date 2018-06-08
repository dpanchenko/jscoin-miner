const config = require('config');
const createDebug = require('debug');
const Chain = require('../classes/chain');
const Transactions = require('../classes/transactions');
const Wallet = require('../classes/wallet');

const log = createDebug(`${config.app.name}:service:blockchain`);

const { output: MINER_OUTPUT } = config.miner;

if (!MINER_OUTPUT) {
  throw new Error('Miner output is not defined');
}

module.exports = (db) => {
  const blockchain = new Chain(db);
  const transactions = new Transactions(db);

  log('Pending transactions', transactions.all.length);

  const mine = async () => {
    log('start mining new block');

    const trans = transactions.all;
    transactions.clear();
    try {
      const newBlock = await blockchain.add({
        transactions: [
          ...trans,
          {
            input: 'coinbase',
            output: MINER_OUTPUT,
            amount: 1,
          },
        ],
      });
      if (!newBlock) {
        throw new Error('New block created failed');
      }
      log('new block', newBlock.hash);
      return newBlock;
    } catch (e) {
      log(e.message);
      trans.map(item => transactions.add(item));
      return null;
    }
  };

  const balance = (address = MINER_OUTPUT) => {
    const wallet = new Wallet(address, blockchain, transactions);
    log('get balance');
    return wallet.balance();
  };

  const blocks = () => {
    log('get blocks');
    return {
      blocks: blockchain.chain,
      tail: blockchain.last.hash,
    };
  };

  const transactionAdd = (data) => {
    log(`add new transaction ${JSON.stringify(data)}`);
    transactions.add(data);
    return transactions.all;
  };

  const transactionsList = () => {
    log('list pending transactions');
    return transactions.all;
  };

  const syncronizeChain = async (data) => {
    log(`sync chain with remote miner nodes ${JSON.stringify(data)}`);
    await blockchain.consensus(data);
  };

  return {
    mine,
    balance,
    blocks,
    transactionAdd,
    transactionsList,
    syncronizeChain,
  };
};
