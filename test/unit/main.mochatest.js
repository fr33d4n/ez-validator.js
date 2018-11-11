const { expect } = require('chai');

const { Validator, Sanitizer } = require('../../src/main');
const ValidatorClass = require('../../src/validator');
const SanitizerClass = require('../../src/sanitizer');

describe('main', () => {
  it('should load and export the Validator class', () => {
    expect(Validator).to.equal(ValidatorClass);
    expect(Sanitizer).to.equal(SanitizerClass);
  });
});
