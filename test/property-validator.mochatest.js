
const { expect } = require('chai');
const sandbox = require('sinon');

const PropertyValidator = require('../src/property-validator');
const ValidationError = require('../src/validation-error');

describe('PropertyValidator class', () => {
  afterEach(() => sandbox.restore());

  describe('#constructor', () => {
    it('should set the field and the validators on the taxonomy, sorting them propertly by priority', () => {
      const validators = {
        string: () => ({ name: 'string', priority: 5 }),
        required: () => ({ name: 'required', priority: 20 }),
        array: () => ({ name: 'array', priority: 10 }),
        object: () => ({ name: 'object', priority: 0 }),
      };

      const propertyValidator = PropertyValidator.build({ field: 'name', taxonomy: { required: true, string: true }, validators });
      expect(propertyValidator.field).to.equal('name');
      expect(propertyValidator.valMethods.length).to.equal(2);
      expect(propertyValidator.valMethods).to.deep.eql([
        { name: 'string', priority: 5 },
        { name: 'required', priority: 20 },
      ]);
    });
  });

  describe('#validate', () => {
    it('should call the validate method for every validator on the class instance and throw a ValidationError', () => {
      const validators = {
        string: () => ({ name: 'string', priority: 5, validate: () => {} }),
        required: () => ({ name: 'required', priority: 20, validate: () => { throw new Error('Required'); } }),
        array: () => ({ name: 'array', priority: 10, validate: () => {} }),
        object: () => ({ name: 'object', priority: 0, validate: () => {} }),
      };

      const propertyValidator = PropertyValidator.build({ field: 'name', taxonomy: { required: true, string: true, unknown: true }, validators });
      expect(() => propertyValidator.validate('meh')).to.throw(ValidationError);
    });

    it('should call the validate method for every validator on the class instance and not throw', () => {
      const validators = {
        string: () => ({ name: 'string', priority: 5, validate: () => {} }),
        required: () => ({ name: 'required', priority: 20, validate: () => {} }),
        array: () => ({ name: 'array', priority: 10, validate: () => {} }),
        object: () => ({ name: 'object', priority: 0, validate: () => {} }),
      };

      const propertyValidator = PropertyValidator.build({ field: 'name', taxonomy: { required: true, string: true }, validators });
      expect(() => propertyValidator.validate('meh')).not.to.throw();
    });
  });
});
