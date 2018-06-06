/* eslint-disable prefer-arrow-callback */
const crypto = require('crypto');
const { expect } = require('chai');
const { calculateHash } = require('../../../core/libs/hash');

describe('hash library', function () {
  describe('calculateHash function', function () {
    it('should calculate correct sha256', function () {
      const testValue = 'test';
      const hash = crypto
        .createHash('sha256')
        .update(testValue)
        .digest('hex');
      expect(calculateHash(testValue)).to.equal(hash);
    });
  });
});
