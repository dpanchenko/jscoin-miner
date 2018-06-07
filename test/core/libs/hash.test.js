/* eslint-disable prefer-arrow-callback */
const crypto = require('crypto');
const { expect } = require('chai');
const sha256hash = require('../../../core/libs/hash');

describe('hash library', function () {
  it('should calculate correct sha256', function () {
    const value = 'test';
    const hash = crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
    expect(sha256hash(value)).to.equal(hash);
  });
});
