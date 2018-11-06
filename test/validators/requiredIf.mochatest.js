
const { expect } = require('chai');

const validatorFactory = require('../../src/validators/requiredIf');

describe('requiredIf validator', () => {
  describe('#constructor', () => {
    it('should throw because the taxonomy is invalid', () => {
      expect(() => validatorFactory()).to.throw();
      expect(() => validatorFactory({})).to.throw();
      expect(() => validatorFactory({ key: 'name' })).to.throw();
      expect(() => validatorFactory({ key: 'name', condition: 'unknown' })).to.throw();
      expect(() => validatorFactory({ key: 'name', condition: '===' })).not.to.throw();
      expect(() => validatorFactory({ key: 'name', condition: '===', value: 'john' })).not.to.throw();
    });

    it('should return an active validator', () => {
      const val = validatorFactory({ key: 'name', condition: '===', value: 'john' });
      expect(val.priority).to.equal(0); /* Highest prio */
      expect(val.validate).to.be.a('function');
    });
  });

  describe('#operators', () => {
    it('=== should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '===',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 20 })).not.to.throw();
      expect(() => val.validate(undefined, { age: '18' })).not.to.throw();
      expect(() => val.validate(undefined, { age: 18 })).to.throw();
      expect(() => val.validate(null, { age: 18 })).to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('== should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '==',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 20 })).not.to.throw();
      expect(() => val.validate(undefined, { age: '18' })).to.throw();
      expect(() => val.validate(undefined, { age: 18 })).to.throw();
      expect(() => val.validate(null, { age: 18 })).to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('!== should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '!==',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).to.throw(); // age is undefined which is !== 18
      expect(() => val.validate(undefined, { age: 20 })).to.throw();
      expect(() => val.validate(undefined, { age: '18' })).to.throw();
      expect(() => val.validate(undefined, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 18 })).not.to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('!= should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '!=',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).to.throw();
      expect(() => val.validate(undefined, { age: 20 })).to.throw();
      expect(() => val.validate(undefined, { age: '18' })).not.to.throw();
      expect(() => val.validate(undefined, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 18 })).not.to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('> should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '>',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 20 })).to.throw();
      expect(() => val.validate(undefined, { age: '20' })).to.throw();
      expect(() => val.validate(undefined, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 20 })).to.throw();
      expect(() => val.validate('john', { age: 20 })).not.to.throw();
    });

    it('>= should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '>=',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 18 })).to.throw();
      expect(() => val.validate(undefined, { age: '18' })).to.throw();
      expect(() => val.validate(null, { age: 18 })).to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('< should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '<',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 16 })).to.throw();
      expect(() => val.validate(undefined, { age: '16' })).to.throw();
      expect(() => val.validate(undefined, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 18 })).not.to.throw();
      expect(() => val.validate(null, { age: 16 })).to.throw();
      expect(() => val.validate('john', { age: 16 })).not.to.throw();
    });

    it('<= should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: '<=',
        value: 18
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 18 })).to.throw();
      expect(() => val.validate(undefined, { age: '18' })).to.throw();
      expect(() => val.validate(null, { age: 18 })).to.throw();
      expect(() => val.validate(null, { age: 16 })).to.throw();
      expect(() => val.validate('john', { age: 18 })).not.to.throw();
    });

    it('oneOf should require if the input is inside the value ', () => {
      const taxonomy = {
        key: 'age',
        condition: 'oneOf',
        value: [1, 2, 3]
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).not.to.throw();
      expect(() => val.validate(undefined, { age: 1 })).to.throw();
      expect(() => val.validate(undefined, { age: 2 })).to.throw();
      expect(() => val.validate(null, { age: 3 })).to.throw();
      expect(() => val.validate(null, { age: 4 })).not.to.throw();
      expect(() => val.validate('john', { age: 1 })).not.to.throw();
    });

    it('notOneOf should work enforcing JS standards ', () => {
      const taxonomy = {
        key: 'age',
        condition: 'notOneOf',
        value: [1, 2, 3]
      };

      const val = validatorFactory(taxonomy);
      expect(() => val.validate(undefined, { })).to.throw();
      expect(() => val.validate(undefined, { age: 1 })).not.to.throw();
      expect(() => val.validate(undefined, { age: 2 })).not.to.throw();
      expect(() => val.validate(null, { age: 3 })).not.to.throw();
      expect(() => val.validate(null, { age: 4 })).to.throw();
      expect(() => val.validate('john', { age: 6 })).not.to.throw();
    });
  });
});
