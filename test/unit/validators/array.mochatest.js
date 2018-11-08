const { expect } = require('chai');

const validatorFactory = require('../../../src/validators/array');

describe('array validator', () => {
  describe('#constructor', () => {
    it('should return a new inactive validator', () => {
      const val = validatorFactory(false);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).not.to.throw();
    });

    it('should return an active validator, which performs basic array validation as there is no complex taxonomy', () => {
      const val = validatorFactory(true);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate(12)).to.throw();
      expect(() => val.validate()).not.to.throw();
      expect(() => val.validate([])).not.to.throw();
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
      expect(() => val.validate([])).not.to.throw();
    });
  });

  describe('#restrictions: length', () => {
    it('should not check anything, with empty modifiers', () => {
      const taxonomy = {
        length: {}
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate([])).not.to.throw();
      expect(() => val.validate([1, 2, 3])).not.to.throw();
    });

    it('should check the different min and max modifiers', () => {
      const taxonomy = {
        length: {
          min: 1,
          max: 3
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate([])).to.throw();
      expect(() => val.validate([1])).not.to.throw();
      expect(() => val.validate([1, 2, 3, 4])).to.throw();
    });

    it('should check the exactly modifier', () => {
      const taxonomy = {
        length: {
          exactly: 2,
        }
      };
      const val = validatorFactory(taxonomy);
      expect(() => val.validate([])).to.throw();
      expect(() => val.validate([1])).to.throw();
      expect(() => val.validate([1, 2])).not.to.throw();
      expect(() => val.validate([1, 2, 3])).to.throw();
    });
  });

  describe('#restrictions: nested validation', () => {
    it('should perform nested array validation. Should apply this validation to every member of the array', () => {
      const taxonomy = {
        string: true
      };
      const val = validatorFactory(taxonomy);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate([1, 2])).to.throw();
      expect(() => val.validate(['a', 'b'])).not.to.throw();
      expect(() => val.validate([])).not.to.throw();
      expect(() => val.validate(['a', 'b', 'c', 1])).to.throw();
    });

    it('should perform nested array validation. Should apply complex nested validation', () => {
      const taxonomy = {
        array: {
          length: { min: 1 },
          number: {
            range: { min: 1990, max: 2018 },
          },
        }
      };

      const val = validatorFactory(taxonomy);
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
      expect(() => val.validate([1, 2])).to.throw();
      expect(() => val.validate([[2000], []])).to.throw();
      expect(() => val.validate([[2000], [2001]])).not.to.throw();
      expect(() => val.validate([[2000], [1900]])).to.throw();
      expect(() => val.validate([[2000], [1990, 2005]])).not.to.throw();
    });
  });
});
