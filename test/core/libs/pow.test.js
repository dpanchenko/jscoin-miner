/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const proxyquire = require('proxyquire');
const MOCK_COMPLEXITY = 1;

const sha256mock = arg => arg;

const { proofOfWork, validateBlock } = proxyquire('../../../core/libs/pow', {
  config: {
    miner: {
      complexity: MOCK_COMPLEXITY,
    },
  },
});

const powLib = proxyquire('../../../core/libs/pow', {
  config: {
    miner: {
      complexity: MOCK_COMPLEXITY,
    },
  },
  './hash': sha256mock,
});

const defaultDataHashMock = `0${MOCK_COMPLEXITY}`;

const blockDataMock = {
  index: 1,
  timestamp: Date.now(),
  data: 'data',
  previousHash: '0',
  nonce: 0,
};

describe('pow library', function () {
  describe('checkHashWithTarget function', function () {
    it('should return true for hash started with 0', function () {
      expect(powLib.checkHashWithTarget('0xxxxxx')).to.equal(true);
    });
    it('should return false for hash started with not 0', function () {
      expect(powLib.checkHashWithTarget('xxxxxxx')).to.equal(false);
    });
  });
  describe('stringifyData function', function () {
    it('should return stringified object if data is object', function () {
      const data = {
        test: 1,
      };
      expect(powLib.stringifyData(data)).to.equal(JSON.stringify(data));
    });
    it('should return the same data if data has scalar type', function () {
      const data = 'string';
      expect(powLib.stringifyData(data)).to.equal(data);
    });
  });
  describe('calculateHash function', function () {
    it('should return hash for default data', function () {
      expect(powLib.calculateHash()).to.equal(sha256mock(defaultDataHashMock));
    });
    it('should return hash for specified data', function () {
      const { index, timestamp, data, previousHash, nonce } = blockDataMock;
      const blockDataHashMock = sha256mock(`${index}${timestamp}${powLib.stringifyData(data)}${previousHash}${nonce}${MOCK_COMPLEXITY}`);
      expect(powLib.calculateHash(blockDataMock)).to.equal(blockDataHashMock);
    });
  });
  describe('validateBlock function', function () {
    const { index, timestamp, data, previousHash, nonce } = blockDataMock;
    const blockDataHashMock = sha256mock(`${index}${timestamp}${powLib.stringifyData(data)}${previousHash}${nonce}${MOCK_COMPLEXITY}`);
    it('should return true for valid block', function () {
      const blockMock = {
        ...blockDataMock,
        hash: blockDataHashMock,
      };
      expect(powLib.validateBlock(blockMock)).to.equal(true);
    });
    it('should return false for not valid data', function () {
      const blockMock = {
        ...blockDataMock,
        hash: '',
      };
      expect(powLib.validateBlock(blockMock)).to.equal(false);
    });
  });
  describe('proofOfWork function', function () {
    it('should resolve with calculated hash and it should be validated', async function () {
      const proof = await proofOfWork(blockDataMock);
      expect(proof).to.have.property('hash');
      expect(proof).to.have.property('nonce');
      expect(validateBlock({
        ...blockDataMock,
        ...proof,
      })).to.equal(true);
    });
  });
});
