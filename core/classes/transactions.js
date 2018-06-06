const config = require('config');
const createDebug = require('debug');

const log = createDebug(`${config.app.name}:classes:transactions`);

class Transactions {
  constructor(db) {
    if (!db) {
      throw new Error('Db not set');
    }
    this.list = db.getCollection('transactions');
    if (this.list === null) {
      log('transactions collection not exist. creating...');
      this.list = db.addCollection('transactions');
    }
  }
  get all() {
    return this.list.chain().data({ removeMeta: true });
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
      this.list.insert(transaction);
    }
    return this.list.chain().data({ removeMeta: true });
  }
  clear() {
    this.list.clear();
  }
}

module.exports = Transactions;
