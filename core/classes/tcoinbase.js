const TInput = require('./tinput');
const TOutput = require('./toutput');
const Transaction = require('./transaction');
const sha256hash = require('../libs/hash');

const SUBSIDY = 1;

class TransactionCoinbase extends Transaction {
  constructor(address) {
    const id = sha256hash(`${Date.now()}${SUBSIDY}coinbase${address}`);
    const input = new TInput(null, -1, `Rewards to ${address}`);
    const output = new TOutput(SUBSIDY, address);
    super(id, input, output);
  }
}

module.exports = TransactionCoinbase;
