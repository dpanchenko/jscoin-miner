/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');

describe('Try to test something', function () {
  it('should passed', function () {
    const test = 1;
    expect(test).to.eql(test);
  });
});
