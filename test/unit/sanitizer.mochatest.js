const { expect } = require('chai');

const { Sanitizer } = require('../../src/main');

describe('Sanitizer tests', () => {
  describe('constructor', () => {
    it('should throw an error, because the taxonomy is not an object', () => {
      expect(() => Sanitizer.build({ taxonomy: true })).to.throw('Invalid sanitizer taxonomy');
    });

    it('should throw an error, because the taxonomy of a key is not an object', () => {
      const taxonomy = {
        name: true,
      };
      expect(() => Sanitizer.build({ taxonomy })).to.throw('Invalid sanitizer taxonomy');
    });

    it('should work fine, and set the transformations property with the correct transformations', () => {
      const taxonomy = {
        name: {
          string: {
            length: { min: 5 }
          }
        },
        age: {
          number: true
        },
        skills: {
          array: {
            length: { max: 5 },
            string: true
          }
        },
        company: {
          object: {
            name: {
              string: true
            },
            location: {
              string: true
            },
            address: {
              specialString: true
            }
          }
        }
      };
      const sanitizer = Sanitizer.build({ taxonomy });
      expect(sanitizer.ignoreExtraProperties).to.equal(false);
      expect(sanitizer.transformations).to.be.a('object');
      expect(sanitizer.transformations.name).to.be.a('function');
      expect(sanitizer.transformations.age).to.be.a('function');
      expect(sanitizer.transformations.skills).to.be.a('function');
      expect(sanitizer.transformations.company).to.be.a('function');
    });
  });

  describe('sanitize', () => {
    it('should not sanitize, because the input is not an object', () => {
      const taxonomy = {
        name: {
          string: {
            length: { min: 5 }
          }
        },
        age: {
          number: true
        },
        skills: {
          array: {
            length: { max: 5 },
            string: true
          }
        },
        company: {
          object: {
            name: {
              string: true
            },
            location: {
              string: true
            },
            address: {
              specialString: true
            }
          }
        }
      };

      const input = true;

      const sanitizer = Sanitizer.build({ taxonomy });
      expect(sanitizer.sanitize(input)).to.equal(true);
    });

    it('should sanitize a complex input', () => {
      const taxonomy = {
        name: {
          string: {
            length: { min: 5 }
          }
        },
        age: {
          number: true
        },
        skills: {
          array: {
            length: { max: 5 },
            string: true
          }
        },
        company: {
          object: {
            name: {
              string: true
            },
            location: {
              string: true
            },
            address: {
              specialString: true
            }
          }
        }
      };

      const input = {
        name: 12345,
        age: '23.1',
        skills: [12, 21, true, 'meh'],
        notHere: 'meh',
        company: {
          notHere: 'brr',
          name: 12,
          location: false,
          address: 'meh'
        }
      };

      const sanitizer = Sanitizer.build({ taxonomy });
      const sanitizedInput = sanitizer.sanitize(input);
      expect(Object.keys(sanitizedInput).length).to.equal(4);
      expect(sanitizedInput.name).to.equal('12345');
      expect(sanitizedInput.age).to.equal(23.1);
      expect(sanitizedInput.skills[0]).to.equal('12');
      expect(sanitizedInput.skills[1]).to.equal('21');
      expect(sanitizedInput.skills[2]).to.equal('true');
      expect(sanitizedInput.skills[3]).to.equal('meh');
      expect(Object.keys(sanitizedInput.company).length).to.equal(3);
      expect(sanitizedInput.company.name).to.equal('12');
      expect(sanitizedInput.company.location).to.equal('false');
      expect(sanitizedInput.company.address).to.equal('meh');
    });
  });
});
