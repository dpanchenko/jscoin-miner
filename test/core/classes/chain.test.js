/* eslint-disable prefer-arrow-callback */
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { expect } = require('chai');

class StubBlock {
  nextBlock() {
    return this;
  }
}

const Chain = proxyquire('../../../core/classes/chain', {
  './block': StubBlock,
});

const keyValueMock = {
  key: 'key',
  value: 'value',
};

const generateExistingCollectionStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub().callsFake(() => keyValueMock),
    update: sinon.stub(),
  };
  const db = {
    addCollection: sinon.stub().callsFake(() => collection),
    getCollection: sinon.stub().callsFake(() => collection),
  };
  return { db, collection };
};

const generateNonExistingCollectionStub = () => {
  const collection = {
    insert: sinon.stub(),
    by: sinon.stub().callsFake(() => keyValueMock),
    update: sinon.stub(),
  };
  const db = {
    addCollection: sinon.stub().callsFake(() => collection),
    getCollection: sinon.stub().callsFake(() => null),
  };
  return { db, collection };
};

const generateExistingCollectionWithoutTailStub = () => {
  const collection = {
    by: sinon.stub().callsFake(() => null),
  };
  const db = {
    getCollection: sinon.stub().callsFake(() => collection),
  };
  return { db, collection };
};

const generateExistingCollectionLastBlockStub = () => {
  const collection = {
    by: sinon.stub().callsFake(() => new StubBlock()),
  };
  const db = {
    getCollection: sinon.stub().callsFake(() => collection),
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
    getCollection: sinon.stub().callsFake(() => collection),
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
        value: 'value',
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
    expect(chain.last instanceof StubBlock).to.equal(true);
  });
  it('should return null instead last block in non consistent blockchain', function () {
    const { db } = generateExistingCollectionLastBlockNullStub();
    const chain = new Chain(db);
    expect(chain.last).to.equal(null);
  });
  it('should return null when add block to non consistent blockchain', function () {
    const { db } = generateExistingCollectionLastBlockNullStub();
    const chain = new Chain(db);
    const result = chain.add('data');
    expect(result).to.equal(null);
  });
  describe('add new block to chain', function () {
    const { db, collection } = generateExistingCollectionAddBlockStub();
    const chain = new Chain(db);
    const newBlock = chain.add({});
    it('should return added block', function () {
      expect(newBlock instanceof StubBlock).to.equal(true);
    });
    it('should following flow', function () {
      expect(db.getCollection.called).to.equal(true);
      expect(collection.by.called).to.equal(true);
      expect(collection.insert.called).to.equal(true);
      expect(collection.update.called).to.equal(true);
    });
  });
});
