/* eslint-disable prefer-arrow-callback */
const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');
const defaultTimezone = Date.now();
const Block = proxyquire('../../../core/classes/block', {
  '../libs/hash': {
    calculateHash: arg => arg,
  },
});

sinon.stub(Date, 'now').callsFake(() => defaultTimezone);

describe('Block class', function () {
  it('should create an instance of class', function () {
    const block = new Block();
    expect(block instanceof Block).to.equal(true);
  });
  it('should have properties', function () {
    const block = new Block();
    expect(block).to.have.property('index');
    expect(block).to.have.property('timestamp');
    expect(block).to.have.property('data');
    expect(block).to.have.property('previousHash');
    expect(block).to.have.property('hash');
  });
  it('should return correct data if data is object', function () {
    const data = {
      test: 1,
    };
    const block = new Block({ data });
    expect(block.getDataStr()).to.equal(JSON.stringify(data));
  });
  it('should return correct data if data is string', function () {
    const data = 'string';
    const block = new Block({ data });
    expect(block.getDataStr()).to.equal(data);
  });
  it('should calculate correct hash for genesis block', function () {
    const hash = `0${defaultTimezone}genesis0`;
    const block = new Block();
    expect(block.calculateHash()).to.equal(hash);
  });
  it('should calculate correct hash for regular block', function () {
    const index = 1;
    const data = 'test';
    const previousHash = 'previousHash';
    const expectedHash = `${index}${defaultTimezone}${data}${previousHash}`;
    const block = new Block({ index, data, previousHash });
    expect(block.calculateHash()).to.equal(expectedHash);
  });
  it('should return correct next block', function () {
    const block = new Block();
    const nextBlock = block.nextBlock('test');
    expect(nextBlock instanceof Block).to.equal(true);
    expect(nextBlock).not.to.equal(block);
    expect(nextBlock).to.have.property('index');
    expect(nextBlock).to.have.property('timestamp');
    expect(nextBlock).to.have.property('data');
    expect(nextBlock).to.have.property('previousHash');
    expect(nextBlock).to.have.property('hash');
    expect(nextBlock.index).to.equal(block.index + 1);
    expect(nextBlock.previousHash).to.equal(block.hash);
  });
});
