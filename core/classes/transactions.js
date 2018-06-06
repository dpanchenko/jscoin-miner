class Transactions {
  constructor() {
    this.list = [];
  }
  get all() {
    return Array.prototype.concat(this.list);
  }
  static check(args) {
    const { input, output, amount } = args || {};
    if (!input || !output || !amount) {
      return false;
    }
    return { input, output, amount };
  }
  add(data) {
    const transaction = Transactions.check(data);
    if (transaction !== false) {
      this.list.push(transaction);
    }
    return this.list;
  }
  clear() {
    this.list = [];
  }
}

module.exports = Transactions;
