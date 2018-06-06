/* eslint-disable prefer-arrow-callback */
const proxyquire = require('proxyquire');
const { expect } = require('chai');

class StubBlock {
  nextBlock() {
    return this;
  }
}

const Chain = proxyquire('../../../core/classes/chain', {
  './block': StubBlock,
});

describe('Chain class', function () {
  it('should create an instance of class', function () {
    const chain = new Chain();
    expect(chain instanceof Chain).to.equal(true);
  });
  it('should have properties', function () {
    const chain = new Chain();
    expect(chain).to.have.property('list');
    expect(chain).to.have.property('chain');
    expect(chain).to.have.property('last');
    expect(chain).to.have.property('add');
  });
  it('should have genesis block after create', function () {
    const chain = new Chain();
    expect(chain.chain.length).to.equal(1);
    expect(chain.last instanceof StubBlock).to.equal(true);
  });
  it('should add new block to chain correctly', function () {
    const chain = new Chain();
    const newBlock = chain.add();
    expect(chain.chain.length).to.equal(2);
    expect(newBlock instanceof StubBlock).to.equal(true);
    expect(chain.last).to.equal(newBlock);
  });
});
