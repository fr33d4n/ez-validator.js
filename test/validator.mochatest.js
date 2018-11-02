
const { expect } = require('chai');
const sandbox = require('sinon');

const { match } = sandbox;

const Validator = require('../src/validator');
const PropertyValidator = require('../src/property-validator');
const ValidationError = require('../src/validation-error');

const taxonomy = {
  name: {
    required: true,
    string: true
  },
  surname: {
    string: {
      length: { max: 50 }
    }
  }
};

const options = {
  failFast: true
};

describe('Validator class', () => {
  afterEach(() => sandbox.restore());

  describe('#constructor', () => {
    let mockPropertyValidator;
    beforeEach(() => {
      mockPropertyValidator = sandbox.mock(PropertyValidator);
    });

    it('should initialize an empty validator if the input is empty', () => {
      mockPropertyValidator.expects('build').never();
      const v = new Validator();
      expect(v.failFast).to.equal(false);
      expect(v.schema).to.eql({});
      expect(v.requiredProperties).to.eql([]);
      sandbox.verify();
    });

    it('should initialize a validator with 2 fields on it, fetching the required properties', () => {
      mockPropertyValidator.expects('build').once().withArgs(match({ field: 'name', taxonomy: taxonomy.name })).returns({ required: true });
      mockPropertyValidator.expects('build').once().withArgs(match({ field: 'surname', taxonomy: taxonomy.surname })).returns({});

      const v = new Validator({ taxonomy, options });
      expect(v.failFast).to.equal(true);
      expect(Object.keys(v.schema).length).to.equal(2);
      expect(v.requiredProperties).to.eql(['name']);
      sandbox.verify();
    });
  });

  describe('#validate', () => {
    let validator;
    let propertyValidatorName;
    let propertyValidatorSurname;
    let mockPropertyValidator;

    beforeEach(() => {
      propertyValidatorName = { required: true, validate: () => {} };
      propertyValidatorSurname = { validate: () => {} };

      mockPropertyValidator = sandbox.mock(PropertyValidator);
      mockPropertyValidator.expects('build').once().withArgs(match({ field: 'name', taxonomy: taxonomy.name })).returns(propertyValidatorName);
      mockPropertyValidator.expects('build').once().withArgs(match({ field: 'surname', taxonomy: taxonomy.surname })).returns(propertyValidatorSurname);

      validator = Validator.build({ taxonomy, options });
    });

    it('should throw as the input is null', () => {
      const input = null;
      expect(() => validator.validate(input)).to.throw(ValidationError);
    });

    it('should throw as the input not a map', () => {
      const input = [];
      expect(() => validator.validate(input)).to.throw(ValidationError);
    });

    it('should throw as the input has not all required fields', () => {
      const input = {
        surname: 'smith',
        age: 23
      };
      expect(() => validator.validate(input)).to.throw(ValidationError);
    });

    it('should properties not on the taxonomy, and call validate for the ones that are in', () => {
      const input = {
        name: 'john',
        surname: 'smith'
      };

      expect(() => validator.validate(input)).not.to.throw(ValidationError);
    });
  });
});
