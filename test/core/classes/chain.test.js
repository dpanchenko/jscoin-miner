/* eslint-disable prefer-arrow-callback */
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { expect } = require('chai');

class StubBlock {
  generateNextBlock(data) {
    if (data === 'fail') {
      return Promise.resolve(null);
    }
    return Promise.resolve(this);
  }
}

const remoteChainResponseMock = {
  blocks: [
    {
      hash: '',
    },
  ],
  tail: 'testtail',
};

const Chain = proxyquire('../../../core/classes/chain', {
  './block': StubBlock,
  'request-promise-native': () => Promise.resolve([
    JSON.stringify(remoteChainResponseMock),
  ]),
});

const keyValueMock = {
  key: 'key',
  value: '{}',
};

const generateExistingCollectionStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub().returns(keyValueMock),
    update: sinon.stub(),
    clear: sinon.stub(),
    chain: sinon.stub().returns({
      find: () => ({
        data: () => [],
      }),
    }),
  };
  const db = {
    addCollection: sinon.stub().returns(collection),
    getCollection: sinon.stub().returns(collection),
  };
  return { db, collection };
};

const generateExistingCollectionWithBlocksStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub().returns(keyValueMock),
    update: sinon.stub(),
    clear: sinon.stub(),
    chain: sinon.stub().returns({
      find: () => ({
        data: () => [{}, {}],
      }),
    }),
  };
  const db = {
    addCollection: sinon.stub().returns(collection),
    getCollection: sinon.stub().returns(collection),
  };
  return { db, collection };
};

const generateNonExistingCollectionStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub().returns(keyValueMock),
    update: sinon.stub(),
    chain: sinon.stub().returns({
      find: () => ({
        data: () => [],
      }),
    }),
  };
  const db = {
    addCollection: sinon.stub().returns(collection),
    getCollection: sinon.stub().returns(null),
  };
  return { db, collection };
};

const generateExistingCollectionWithoutTailStub = () => {
  const collection = {
    by: sinon.stub().returns(null),
  };
  const db = {
    getCollection: sinon.stub().returns(collection),
  };
  return { db, collection };
};

const generateExistingCollectionLastBlockStub = () => {
  const collection = {
    by: sinon.stub().returns(keyValueMock),
  };
  const db = {
    getCollection: sinon.stub().returns(collection),
  };
  return { db, collection };
};

const generateExistingCollectionLastBlockNullStub = () => {
  const collection = {
    by: sinon.stub()
      .onFirstCall()
      .returns(keyValueMock)
      .onSecondCall()
      .returns(null),
  };
  const db = {
    getCollection: sinon.stub().returns(collection),
  };
  return { db, collection };
};

const generateExistingCollectionAddBlockStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub()
      .onFirstCall()
      .returns(keyValueMock)
      .onSecondCall()
      .returns({
        value: '{}',
      })
      .onThirdCall()
      .returns({})
      .onCall(4)
      .returns({}),
    update: sinon.stub(),
  };
  const db = {
    getCollection: sinon.stub().callsFake(() => collection),
  };
  return { db, collection };
};


describe('Chain class', function () {
  it('should throw if create class without db', function () {
    expect(function () {
      const chain = new Chain(); // eslint-disable-line
    }).to.throw('Db not set');
  });
  describe('create with existing collection', function () {
    const { db, collection } = generateExistingCollectionStub();
    const chain = new Chain(db);
    it('should create an instance of class', function () {
      expect(chain instanceof Chain).to.equal(true);
    });
    it('should have properties', function () {
      expect(chain).to.have.property('tail');
      expect(chain).to.have.property('tailKey');
      expect(chain).to.have.property('blocks');
      expect(chain).to.have.property('chain');
      expect(chain).to.have.property('last');
      expect(chain).to.have.property('add');
      expect(chain.tail).to.equal(keyValueMock.value);
      expect(chain.tailKey).to.equal('tail');
    });
    it('should use already existing collection flow', function () {
      expect(db.getCollection.called).to.equal(true);
      expect(db.addCollection.called).to.equal(false);
      expect(collection.by.called).to.equal(true);
      expect(collection.insert.called).to.equal(false);
      expect(collection.update.called).to.equal(false);
    });
  });
  describe('create with not existing collection', function () {
    const { db, collection } = generateNonExistingCollectionStub();
    const chain = new Chain(db);
    it('should create an instance of class', function () {
      expect(chain instanceof Chain).to.equal(true);
    });
    it('should have properties', function () {
      expect(chain).to.have.property('tail');
      expect(chain).to.have.property('tailKey');
      expect(chain).to.have.property('blocks');
      expect(chain).to.have.property('chain');
      expect(chain).to.have.property('last');
      expect(chain).to.have.property('add');
      expect(chain.tail).to.equal(keyValueMock.value);
      expect(chain.tailKey).to.equal('tail');
    });
    it('should use create collection flow', function () {
      expect(db.getCollection.called).to.equal(true);
      expect(db.addCollection.called).to.equal(true);
      expect(collection.by.called).to.equal(true);
      expect(collection.insert.called).to.equal(true);
      expect(collection.update.called).to.equal(false);
    });
  });
  it('should throw if existing collection doesn\'t have tail (broken)', function () {
    const { db } = generateExistingCollectionWithoutTailStub();
    expect(function () {
      const chain = new Chain(db); // eslint-disable-line
    }).to.throw('Blockchain broken. Tail is not exist');
  });
  it('should have correct last block in consistent blockchain', function () {
    const { db } = generateExistingCollectionLastBlockStub();
    const chain = new Chain(db);
    expect(chain.last() instanceof StubBlock).to.equal(true);
  });
  it('should return null instead last block in non consistent blockchain', function () {
    const { db } = generateExistingCollectionLastBlockNullStub();
    const chain = new Chain(db);
    expect(chain.last()).to.equal(null);
  });
  it('should return null when add block to non consistent blockchain', async function () {
    const { db } = generateExistingCollectionLastBlockNullStub();
    const chain = new Chain(db);
    const result = await chain.add('data');
    expect(result).to.equal(null);
  });
  it('add new block to chain', async function () {
    const { db, collection } = generateExistingCollectionAddBlockStub();
    const chain = new Chain(db);
    const newBlock = await chain.add({});
    expect(newBlock instanceof StubBlock).to.equal(true);
    expect(db.getCollection.called).to.equal(true);
    expect(collection.by.called).to.equal(true);
    expect(collection.insert.called).to.equal(true);
    expect(collection.update.called).to.equal(true);
  });
  it('fail add new block to chain', async function () {
    const { db, collection } = generateExistingCollectionAddBlockStub();
    const chain = new Chain(db);
    const newBlock = await chain.add('fail');
    expect(newBlock).to.equal(null);
    expect(db.getCollection.called).to.equal(true);
    expect(collection.by.called).to.equal(true);
    expect(collection.insert.called).to.equal(false);
    expect(collection.update.called).to.equal(false);
  });
  it('consensus should use remote chain', async function () {
    const { db, collection } = generateExistingCollectionStub();
    const chain = new Chain(db);
    await chain.consensus([
      {
        address: 'asd',
      },
    ]);
    expect(chain.tail).to.equal(remoteChainResponseMock.tail);
    expect(db.getCollection.called).to.equal(true);
    expect(collection.by.called).to.equal(true);
    expect(collection.clear.called).to.equal(true);
    expect(collection.insert.called).to.equal(true);
    expect(collection.update.called).to.equal(false);
  });
  it('consensus should use local chain', async function () {
    const { db, collection } = generateExistingCollectionWithBlocksStub();
    const chain = new Chain(db);
    await chain.consensus([
      {
        address: 'asd',
      },
    ]);
    expect(db.getCollection.called).to.equal(true);
    expect(collection.by.called).to.equal(true);
    expect(collection.clear.called).to.equal(false);
    expect(collection.insert.called).to.equal(false);
    expect(collection.update.called).to.equal(false);
  });
});
