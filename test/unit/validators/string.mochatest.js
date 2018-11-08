const { expect } = require('chai');

const validatorFactory = require('../../../src/validators/string');

describe('string validator', () => {
  describe('#constructor', () => {
    it('should return a new inactive validator', () => {
      const val = validatorFactory(false);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).not.to.throw();
    });

    it('should return an active validator, which performs basic string validation as there is no complex taxonomy', () => {
      const val = validatorFactory(true);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).to.throw();
      expect(() => val.validate()).not.to.throw();
      expect(() => val.validate('asdf')).not.to.throw();
    });

    it('should return an active validator, which omits unknown restrictions', () => {
      const taxonomy = {
        meh: true
      };
      const val = validatorFactory(taxonomy);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).to.throw();
      expect(() => val.validate()).not.to.throw();
      expect(() => val.validate('asdf')).not.to.throw();
    });
  });

  describe('#restrictions: length', () => {
    it('should not check anything, with empty modifiers', () => {
      const taxonomy = {
        length: {}
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate('1234123')).not.to.throw();
      expect(() => val.validate('')).not.to.throw();
    });

    it('should check the different min and max modifiers', () => {
      const taxonomy = {
        length: {
          min: 1,
          max: 10
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate('')).to.throw();
      expect(() => val.validate('12345678901')).to.throw();
      expect(() => val.validate('1')).not.to.throw();
      expect(() => val.validate('1234567890')).not.to.throw();
    });

    it('should check the exactly modifier', () => {
      const taxonomy = {
        length: {
          exactly: 2,
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate('')).to.throw();
      expect(() => val.validate('1')).to.throw();
      expect(() => val.validate('22')).not.to.throw();
      expect(() => val.validate('333')).to.throw();
    });
  });

  describe('#restrictions: pattern', () => {
    it('should fail on initialization. The taxonomy is not a RegExp', () => {
      const taxonomy = {
        pattern: 'asd'
      };
      expect(() => validatorFactory(taxonomy)).to.throw();
    });

    it('should test the input against the pattern and throw if it does not match', () => {
      const taxonomy = {
        pattern: /[a-z]*/
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate('')).not.to.throw();
      expect(() => val.validate('A')).to.throw();
      expect(() => val.validate('abcd')).not.to.throw();
      expect(() => val.validate('abcd1')).to.throw();
    });
  });

  describe('#restrictions: oneOf', () => {
    it('should fail on initialization. The taxonomy is not an Array', () => {
      const taxonomy = {
        oneOf: 'asd'
      };
      expect(() => validatorFactory(taxonomy)).to.throw();
    });

    it('should test the input against the array and throw if the input is not a element of the array', () => {
      const taxonomy = {
        oneOf: ['foo', 'bar', 'meh']
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate('foo')).not.to.throw();
      expect(() => val.validate('lol')).to.throw();
      expect(() => val.validate('meh')).not.to.throw();
      expect(() => val.validate('brr')).to.throw();
    });
  });
});
