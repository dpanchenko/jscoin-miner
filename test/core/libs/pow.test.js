/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const { proofOfWork } = require('../../../core/libs/pow');

describe('pow library', function () {
  describe('proofOfWork function', function () {
    it('should calculate correct nonce for values less than 9', function () {
      let nonce = proofOfWork();
      expect(nonce).to.equal(9);
      nonce = proofOfWork(nonce);
      expect(nonce).to.equal(18);
      nonce = proofOfWork(nonce);
      expect(nonce).to.equal(27);
      nonce = proofOfWork(nonce);
      expect(nonce).to.equal(36);
    });
  });
});
