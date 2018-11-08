const { expect } = require('chai');

const validatorFactory = require('../../../src/validators/object');

describe('object validator', () => {
  describe('#constructor', () => {
    it('should throw because the taxonomy is invalid', () => {
      expect(() => validatorFactory()).to.throw();
      expect(() => validatorFactory(true)).to.throw();
      expect(() => validatorFactory({ })).not.to.throw();
      expect(() => validatorFactory({ name: { string: true } })).not.to.throw();

      const val = validatorFactory({ name: { string: true } });
      expect(val.priority).to.equal(10);
      expect(val.validate).to.be.a('function');
    });
  });

  describe('nested validation', () => {
    it('should validate a 1-level object just fine', () => {
      const taxonomy = {
        name: {
          string: true,
        },
        age: {
          number: {
            isPositive: true,
            isInteger: true,
          }
        }
      };

      const val = validatorFactory(taxonomy, {});
      expect(() => val.validate({ name: 'john', age: 32 })).not.to.throw();
      expect(() => val.validate({ })).not.to.throw();
      expect(() => val.validate({ name: 'john' })).not.to.throw();
      expect(() => val.validate({ age: 32 })).not.to.throw();
      expect(() => val.validate({ name: 'john', age: 3.14 })).to.throw();
      expect(() => val.validate({ name: ['john'], age: 32 })).to.throw();
    });

    it('should validate a big n-level object just fine', () => {
      const stackOverflowUser = {
        profile: {
          object: {
            general: {
              name: {
                required: true,
                string: true,
              },
              title: {
                string: {
                  length: { min: 3, max: 255 }
                }
              },
              description: {
                string: {
                  length: { max: 1024 }
                }
              }
            },
            tags: {
              array: {
                length: { max: 10 },
                string: {
                  length: { max: 32 }
                }
              }
            }
          }
        },
        activity: {
          array: {
            length: { max: 3 },
            object: {
              question: {
                object: {
                  title: { string: true },
                  summary: { string: true },
                }
              },
              answer: {
                object: {
                  text: { string: { length: { min: 1, max: 1024 } } },
                  upvotes: {
                    number: {
                      isPositive: true,
                      isInteger: true,
                    }
                  },
                  downvotes: {
                    number: {
                      isPositive: true,
                      isInteger: true,
                    }
                  }
                }
              }
            }
          }
        }
      };

      const val = validatorFactory(stackOverflowUser, {});

      const input = {
        profile: {
          general: {
            name: 'john',
            title: 'Software Engineer',
            description: ''
          },
          tags: ['node.js', 'validators', 'TDD']
        },
        activity: [{
          question: {
            title: 'How to git gud?',
            summary: 'Pls, teach me sempai!'
          },
          answer: {
            text: 'I do not know how to actually git gud but let me google that for you',
            upvotes: 25,
            downvotes: 0
          }
        }]
      };
      expect(() => val.validate(input)).not.to.throw();
    });
  });
});
