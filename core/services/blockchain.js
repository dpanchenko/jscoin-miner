const config = require('config');
const createDebug = require('debug');
const Chain = require('../classes/chain');
const Transactions = require('../classes/transactions');
const { proofOfWork } = require('../libs/pow');

const log = createDebug(`${config.app.name}:service:blockchain`);

const { output: MINER_OUTPUT } = config.miner;

if (!MINER_OUTPUT) {
  throw new Error('Miner output is not defined');
}

module.exports = (db) => {
  const blockchain = new Chain(db);
  const transactions = new Transactions(db);

  const mine = () => {
    log('start mining new block');
    const lastBlock = blockchain.last;
    const lastNonce = lastBlock.data.nonce;
    const nonce = proofOfWork(lastNonce);
    transactions.add({
      input: 'coinbase',
      output: MINER_OUTPUT,
      amount: 1,
    });
    const newBlock = blockchain.add({
      nonce,
      transactions: transactions.all,
    });
    transactions.clear();
    log('new block', newBlock.hash);
    return newBlock;
  };

  const blocks = () => {
    log('get blocks');
    return blockchain.chain;
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

  return {
    mine,
    blocks,
    transactionAdd,
    transactionsList,
  };
};
