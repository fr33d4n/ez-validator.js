
const { expect } = require('chai');

const validatorFactory = require('../../src/validators/number');

describe('number validator', () => {
  describe('#constructor', () => {
    it('should return a new inactive validator', () => {
      const val = validatorFactory(false);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).not.to.throw();
    });

    it('should return an active validator, which performs basic number validation as there is no complex taxonomy', () => {
      const val = validatorFactory(true);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      val.validate(12);
      expect(() => val.validate(12)).not.to.throw();
      expect(() => val.validate('12')).not.to.throw();
      expect(() => val.validate()).not.to.throw();
      expect(() => val.validate('asdf')).to.throw();
    });

    it('should not perform string coercion when checking if its a number', () => {
      const taxonomy = {
        strict: true
      };
      const val = validatorFactory(taxonomy);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).not.to.throw();
      expect(() => val.validate('12')).to.throw();
    });
  });

  describe('#restrictions: range', () => {
    it('should not check anything, with empty modifiers', () => {
      const taxonomy = {
        length: {}
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(12)).not.to.throw();
      expect(() => val.validate(0)).not.to.throw();
    });

    it('should check the different min and max modifiers', () => {
      const taxonomy = {
        range: {
          min: 1,
          max: 10,
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(0)).to.throw();
      expect(() => val.validate(11)).to.throw();
      expect(() => val.validate('11')).to.throw();
      expect(() => val.validate(1)).not.to.throw();
      expect(() => val.validate('1')).not.to.throw();
      expect(() => val.validate(10)).not.to.throw();
    });

    it('should check the exactly modifier', () => {
      const taxonomy = {
        range: {
          exactly: 2,
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(2)).not.to.throw();
      expect(() => val.validate('2')).not.to.throw();
      expect(() => val.validate(3)).to.throw();
      expect(() => val.validate(4)).to.throw();
    });
  });

  describe('#restrictions: isPositive', () => {
    it('should throw if the number is not positive', () => {
      const taxonomy = {
        isPositive: true
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(0)).not.to.throw();
      expect(() => val.validate(1)).not.to.throw();
      expect(() => val.validate(-1)).to.throw();
      expect(() => val.validate('0')).not.to.throw();
      expect(() => val.validate('-1')).to.throw();
    });
  });

  describe('#restrictions: isInteger', () => {
    it('should throw if the number is not an integer', () => {
      const taxonomy = {
        isInteger: true
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(0)).not.to.throw();
      expect(() => val.validate(1)).not.to.throw();
      expect(() => val.validate('1')).not.to.throw();
      expect(() => val.validate(3.14)).to.throw();
      expect(() => val.validate('3.14')).to.throw();
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
        oneOf: [1, 2, 4, 8, 16]
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate(1)).not.to.throw();
      expect(() => val.validate(3)).to.throw();
      expect(() => val.validate(8)).not.to.throw();
      expect(() => val.validate('17')).to.throw();
    });
  });
});
