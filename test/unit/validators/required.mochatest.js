const { expect } = require('chai');

const validatorFactory = require('../../../src/validators/required');

describe('required validator', () => {
  describe('#constructor', () => {
    it('should return a new inactive validator', () => {
      const val = validatorFactory(false);
      expect(val.priority).to.equal(0); /* Highest prio */
      expect(val.validate).to.be.a('function');
      expect(() => val.validate()).not.to.throw();
    });

    it('should return an active validator, that throws with null OR undefined inputs', () => {
      const val = validatorFactory(true);
      expect(val.priority).to.equal(0); /* Highest prio */
      expect(val.validate).to.be.a('function');
      expect(() => val.validate()).to.throw();
      expect(() => val.validate(null)).to.throw();
      expect(() => val.validate('john')).not.to.throw();
    });
  });
});
