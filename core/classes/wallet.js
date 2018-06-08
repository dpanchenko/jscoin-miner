const asyncReduce = require('async-reduce');

class Wallet {
  constructor(address, blockchain, transactions) {
    this.blockchain = blockchain;
    this.address = address;
    this.transactions = transactions;
  }
  static calculateTransactions(transactions, address) {
    return transactions.reduce((acc, trx) => {
      const { input, output, amount } = trx;
      if (input === address && output !== address) {
        return {
          ...acc,
          amount: acc.amount - amount,
          credit: Array.prototype.concat(acc.credit, [{
            wallet: output,
            amount,
          }]),
        };
      }
      if (input !== address && output === address) {
        return {
          ...acc,
          amount: acc.amount + amount,
          debet: Array.prototype.concat(acc.debet, [{
            wallet: input,
            amount,
          }]),
        };
      }
      return acc;
    }, { amount: 0, debet: [], credit: [] });
  }
  ballance() {
    return new Promise(resolve =>
      asyncReduce(this.blockchain.chain, { amount: 0, debet: [], credit: [] }, (acc, block, cb) => {
        const { transactions = [] } = block.data;
        const delta = Wallet.calculateTransactions(transactions, this.address);
        cb(null, {
          amount: acc.amount + delta.amount,
          debet: Array.prototype.concat(acc.debet, delta.debet),
          credit: Array.prototype.concat(acc.credit, delta.credit),
        });
      }, (err, confirmed) => {
        const pending = Wallet.calculateTransactions(this.transactions.all, this.address);
        return resolve({ confirmed, pending });
      }));
  }
  async pay(amount, target) {
    const { confirmed } = await this.balance();
    if (confirmed.amount > amount && this.address !== target) {
      this.transaction.add({
        input: this.address,
        output: target,
        amount,
      });
    }
  }
}

module.exports = Wallet;
