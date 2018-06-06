/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const Transactions = require('../../../core/classes/transactions');

describe('Transactions class', function () {
  it('should create an instance of class', function () {
    const transactions = new Transactions();
    expect(transactions instanceof Transactions).to.equal(true);
  });
  it('should have properties', function () {
    const transactions = new Transactions();
    expect(transactions).to.have.property('list');
    expect(transactions).to.have.property('all');
    expect(transactions).to.have.property('add');
    expect(transactions).to.have.property('clear');
  });
  it('should have static method', function () {
    expect(Transactions).to.have.property('check');
  });
  it('should be empty after create', function () {
    const transactions = new Transactions();
    expect(transactions.list.length).to.equal(0);
    expect(transactions.all.length).to.equal(0);
  });
  it('should return copy of list', function () {
    const transactions = new Transactions();
    expect(transactions.list.length).to.equal(transactions.all.length);
    expect(transactions.list).not.to.equal(transactions.all);
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
    const transactions = new Transactions();
    transactions.add(data);
    expect(transactions.list.length).to.equal(1);
    expect(transactions.all.length).to.equal(1);
  });
  it('should not add incorrect transaction', function () {
    const data = null;
    const transactions = new Transactions();
    transactions.add(data);
    expect(transactions.list.length).to.equal(0);
    expect(transactions.all.length).to.equal(0);
  });
  it('should clear successfull', function () {
    const data = {
      input: 'input',
      output: 'output',
      amount: 1,
    };
    const transactions = new Transactions();
    transactions.add(data);
    expect(transactions.list.length).to.equal(1);
    expect(transactions.all.length).to.equal(1);
    transactions.clear();
    expect(transactions.list.length).to.equal(0);
    expect(transactions.all.length).to.equal(0);
  });
});
