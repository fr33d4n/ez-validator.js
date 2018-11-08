const { expect } = require('chai');

const { Validator } = require('../../src/main');
const ValidatorClass = require('../../src/validator');

describe('main', () => {
  it('should load and export the Validator class', () => {
    expect(Validator).to.equal(ValidatorClass);
  });
});
