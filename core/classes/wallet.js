const asyncReduce = require('async-reduce');

class Wallet {
  constructor(address, blockchain, transactions) {
    this.blockchain = blockchain;
    this.address = address;
    this.transactions = transactions;
  }
  static calculateTransactions(transactions, address) {
    return transactions.reduce((sum, trx) => {
      const { input, output, amount } = trx;
      if (input === address && output !== address) {
        return sum - amount;
      }
      if (input !== address && output === address) {
        return sum + amount;
      }
      return sum;
    }, 0);
  }
  ballance() {
    return new Promise((resolve, reject) =>
      asyncReduce(this.blockchain.chain, 0, (acc, block, cb) => {
        const { transactions = [] } = block.data;
        const delta = Wallet.calculateTransactions(transactions, this.address);
        cb(null, acc + delta);
      }, (err, amount) => {
        if (err) {
          return reject(err);
        }
        return resolve(amount);
      }));
  }
}

module.exports = Wallet;
