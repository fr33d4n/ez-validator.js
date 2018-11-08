const { expect } = require('chai');

const { Validator } = require('../../src/main');

describe('Functional validator tests', () => {
  it('should work fine, and validate nothing, as the taxonomy validates nothing', () => {
    const taxonomy = {};
    const validator = Validator.build({ taxonomy });
    const input = {
      name: '',
      age: -12,
      gender: 'koloc'
    };

    expect(validator.validate(input)).not.to.throw;
  });

  it('should work fine, and validate nothing, as the taxonomy validates nothing (2)', () => {
    const taxonomy = {
      name: true,
      age: true,
      gender: true
    };

    const validator = Validator.build({ taxonomy });
    const input = {
      name: '',
      age: -12,
      gender: 'koloc'
    };

    expect(validator.validate(input)).not.to.throw;
  });

  it('should validate only the fields that have well formed validation taxonomy', () => {
    const taxonomy = {
      name: {
        string: { min: 3 },
      },
      age: true,
      gender: true
    };

    const validator = Validator.build({ taxonomy });
    const incorrectInput = {
      name: '',
      age: -12,
      gender: 'koloc'
    };

    const correctInput = {
      name: 'correct',
      age: -12,
      gender: 'koloc'
    };

    expect(validator.validate(incorrectInput)).to.throw;
    expect(validator.validate(correctInput)).not.to.throw;
  });
});
