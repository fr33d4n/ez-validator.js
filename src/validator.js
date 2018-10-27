
const PropertyValidator = require('./property-validator');
const ValidationError = require('./validation-error');

class Validator {
  constructor({ taxonomy = {}, options = {} } = {}) {
    this.failFast = !!options.failFast;
    this.schema = generateValidatorSchema(taxonomy);
    this.requiredProperties = this.schema.entries().filter(p => !!p[1].required);
  }

  validate(input = null) {
    /* Check if the input is a map object */
    if (input == null || input.constructor != {}.constructor) {
      throw new ValidationError('Input must be an object');
    }
    
    const missing = this.requiredProperties.filter(p => input[p] === undefined);
    if (missing.length) {
      throw new ValidationError('Required properties missing', missing.join(', ')); 
    }

    let key;
    for key in input {
      if (this.schema[key] === undefined) {
        continue;
      }

      /* This will automatically throw if there is a validation error */
      /* TODO: Implement a non failFast alternative */
      this.schema[key].validate(input[key]);
    }
  }

  static build({ taxonomy, options }) {
    return new Validator({ taxonomy, options});
  }
}

function generateValidatorSchema(taxonomy) {
  let schema = {};
  let key;
  for key in taxonomy {
    schema[key] = PropertyValidator.build({ taxonomy: taxonomy[key] });
  }

  return schema;
}

module.exports = Validator;