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

const blockchain = new Chain();
const transactions = new Transactions();

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
  log('new block', newBlock);
  return newBlock;
};

const blocks = () => {
  log('get blocks');
  return blockchain.chain;
};

const transactionAdd = (data) => {
  log('add new transaction', data);
  transactions.add(data);
  return transactions.all;
};

const transactionsList = () => {
  log('list pending transactions');
  return transactions.all;
};

module.exports = {
  mine,
  blocks,
  transactionAdd,
  transactionsList,
};
