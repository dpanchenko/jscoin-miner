/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const sinon = require('sinon');
const Transactions = require('../../../core/classes/transactions');

const generateExistingCollectionStub = () => {
  const collection = {
    chain: sinon.stub().returns({
      data: () => [],
    }),
    insert: sinon.stub(),
    clear: sinon.stub(),
  };
  const db = {
    addCollection: sinon.stub(),
    getCollection: sinon.stub().callsFake(() => collection),
  };
  return { db, collection };
};

const generateNonExistingCollectionStub = () => {
  const collection = {
    chain: sinon.stub().returns({
      data: () => [],
    }),
    insert: sinon.stub(),
    clear: sinon.stub(),
  };
  const db = {
    addCollection: sinon.stub().callsFake(() => collection),
    getCollection: sinon.stub().callsFake(() => null),
  };
  return { db, collection };
};

describe('Transactions class', function () {
  it('should throw if create class without db', function () {
    expect(function () {
      const transactions = new Transactions(); // eslint-disable-line
    }).to.throw('Db not set');
  });
  describe('create with existing collection', function () {
    const { db, collection } = generateExistingCollectionStub();
    const transactions = new Transactions(db);
    it('should create an instance of class', function () {
      expect(transactions instanceof Transactions).to.equal(true);
    });
    it('should use correct flow', function () {
      expect(db.getCollection.called).to.equal(true);
      expect(db.addCollection.called).to.equal(false);
      expect(collection.insert.called).to.equal(false);
      expect(collection.chain.called).to.equal(false);
      expect(collection.clear.called).to.equal(false);
    });
    it('should have properties', function () {
      expect(transactions).to.have.property('list');
      expect(transactions).to.have.property('all');
      expect(transactions).to.have.property('add');
      expect(transactions).to.have.property('clear');
    });
  });
  describe('create with non existing collection', function () {
    const { db, collection } = generateNonExistingCollectionStub();
    const transactions = new Transactions(db);
    it('should create an instance of class', function () {
      expect(transactions instanceof Transactions).to.equal(true);
    });
    it('should use correct flow', function () {
      expect(db.getCollection.called).to.equal(true);
      expect(db.addCollection.called).to.equal(true);
      expect(collection.insert.called).to.equal(false);
      expect(collection.chain.called).to.equal(false);
      expect(collection.clear.called).to.equal(false);
    });
    it('should have properties', function () {
      expect(transactions).to.have.property('list');
      expect(transactions).to.have.property('all');
      expect(transactions).to.have.property('add');
      expect(transactions).to.have.property('clear');
    });
  });
  it('should have static method', function () {
    expect(Transactions).to.have.property('check');
  });
  it('should return all transactions (flow)', function () {
    const { db, collection } = generateExistingCollectionStub();
    const transactions = new Transactions(db);
    const all = transactions.all; // eslint-disable-line
    expect(all instanceof Array).to.equal(true);
    expect(db.getCollection.called).to.equal(true);
    expect(db.addCollection.called).to.equal(false);
    expect(collection.insert.called).to.equal(false);
    expect(collection.chain.called).to.equal(true);
    expect(collection.clear.called).to.equal(false);
  });
  it('should check succesfull correct transaction data', function () {
    const checkResult = Transactions.check({
      input: 'input',
      output: 'output',
      amount: 1,
    });
    expect(checkResult).not.to.equal(false);
    expect(checkResult).to.have.property('input');
    expect(checkResult).to.have.property('output');
    expect(checkResult).to.have.property('amount');
    expect(checkResult.input).to.equal('input');
    expect(checkResult.output).to.equal('output');
    expect(checkResult.amount).to.equal(1);
  });
  it('should check unsuccesfull incorrect transaction data', function () {
    expect(Transactions.check({
      input: null,
      output: 'output',
      amount: 1,
    })).to.equal(false);
    expect(Transactions.check({
      input: 'input',
      output: null,
      amount: 1,
    })).to.equal(false);
    expect(Transactions.check({
      input: 'input',
      output: 'output',
      amount: 0,
    })).to.equal(false);
  });
  it('should add items correctly', function () {
    const data = {
      input: 'input',
      output: 'output',
      amount: 1,
    };
    const { db, collection } = generateExistingCollectionStub();
    const transactions = new Transactions(db);
    transactions.add(data);
    expect(db.getCollection.called).to.equal(true);
    expect(db.addCollection.called).to.equal(false);
    expect(collection.insert.called).to.equal(true);
    expect(collection.chain.called).to.equal(true);
    expect(collection.clear.called).to.equal(false);
  });
  it('should not add incorrect transaction', function () {
    const data = null;
    const { db, collection } = generateExistingCollectionStub();
    const transactions = new Transactions(db);
    transactions.add(data);
    expect(db.getCollection.called).to.equal(true);
    expect(db.addCollection.called).to.equal(false);
    expect(collection.insert.called).to.equal(false);
    expect(collection.chain.called).to.equal(true);
    expect(collection.clear.called).to.equal(false);
  });
  it('should clear successfull', function () {
    const { db, collection } = generateExistingCollectionStub();
    const transactions = new Transactions(db);
    transactions.clear();
    expect(db.getCollection.called).to.equal(true);
    expect(db.addCollection.called).to.equal(false);
    expect(collection.insert.called).to.equal(false);
    expect(collection.chain.called).to.equal(false);
    expect(collection.clear.called).to.equal(true);
  });
});
