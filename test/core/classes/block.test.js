/* eslint-disable prefer-arrow-callback */
const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const calculateHashSpy = sinon.spy();
const stringifyDataSpy = sinon.spy();
const proofOfWorkStub = sinon.stub().callsFake(({ data }) =>
  Promise.resolve(data === 'fail' ? null : { hash: 'hash', nonce: 0 }));

const Block = proxyquire('../../../core/classes/block', {
  '../libs/pow': {
    proofOfWork: proofOfWorkStub,
    stringifyData: stringifyDataSpy,
    calculateHash: calculateHashSpy,
  },
});

const defaultTimestamp = Date.now();

const blockDataMock = {
  index: 1,
  timestamp: Date.now(),
  data: 'data',
  previousHash: '0',
  nonce: 0,
  hash: '',
};

sinon.stub(Date, 'now').callsFake(() => defaultTimestamp);

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
    expect(block).to.have.property('nonce');
    expect(block).to.have.property('hash');
  });
  it('when serialize should call stringifyData from pow library', function () {
    const block = new Block(blockDataMock);
    block.serialize();
    expect(stringifyDataSpy.called).to.eql(true);
    stringifyDataSpy.resetHistory();
  });
  it('should generate next block and return it', async function () {
    const block = new Block();
    const nextBlock = await block.generateNextBlock('test data');
    expect(nextBlock instanceof Block).to.equal(true);
  });
  it('should fail to generate next block and return null', async function () {
    const block = new Block();
    const nextBlock = await block.generateNextBlock('fail');
    expect(nextBlock).to.equal(null);
  });
});
