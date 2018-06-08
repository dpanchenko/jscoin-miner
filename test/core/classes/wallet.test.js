/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const sinon = require('sinon');
const Wallet = require('../../../core/classes/wallet');

const mockAddress = 'TEST_ADDRESS';
const mockTransactionsList = [
  {
    input: 'coinbase',
    output: mockAddress,
    amount: 1,
  },
  {
    input: 'coinbase',
    output: mockAddress,
    amount: 1,
  },
  {
    input: mockAddress,
    output: 'other-wallet',
    amount: 1,
  },
  {
    input: 'other-wallet-1',
    output: 'other-wallet',
    amount: 1,
  },
];
const mockStatement = {
  amount: 1,
  debet: [
    {
      wallet: 'coinbase',
      amount: 1,
    },
    {
      wallet: 'coinbase',
      amount: 1,
    },
  ],
  credit: [
    {
      wallet: 'other-wallet',
      amount: 1,
    },
  ],
};

const mockBlockchain = {
  chain: () => ([
    {
      data: {
        transactions: mockTransactionsList,
      },
    },
  ]),
};
const mockTransactions = {
  all: mockTransactionsList,
  add: sinon.stub().returns([]),
};

const mockBalance = {
  confirmed: mockStatement,
  pending: mockStatement,
};

// sinon.stub(Date, 'now').callsFake(() => defaultTimestamp);

describe('Wallet class', function () {
  it('should create an instance of class', function () {
    const wallet = new Wallet(mockAddress, mockBlockchain, mockTransactions);
    expect(wallet instanceof Wallet).to.equal(true);
  });
  it('should calculate correct statement', function () {
    const statement = Wallet.calculateTransactions(mockTransactionsList, mockAddress);
    expect(statement).to.eql(mockStatement);
  });
  it('should calculate correct balance', async function () {
    const wallet = new Wallet(mockAddress, mockBlockchain, mockTransactions);
    const ballance = await wallet.balance();
    expect(wallet instanceof Wallet).to.equal(true);
    expect(ballance).to.eql(mockBalance);
  });
  it('should pay money if enought balance', async function () {
    const wallet = new Wallet(mockAddress, mockBlockchain, mockTransactions);
    await wallet.pay(1, 'other-wallet');
    expect(wallet instanceof Wallet).to.equal(true);
    expect(mockTransactions.add.called).to.equal(true);
    mockTransactions.add.resetHistory();
  });
  it('should not pay money if not enought balance', async function () {
    const wallet = new Wallet(mockAddress, mockBlockchain, mockTransactions);
    await wallet.pay(3, 'other-wallet');
    expect(wallet instanceof Wallet).to.equal(true);
    expect(mockTransactions.add.called).to.equal(false);
    mockTransactions.add.resetHistory();
  });
});
