
const { join } = require('path');
const { readdirSync } = require('fs');

const PropertyValidator = require('./property-validator');
const ValidationError = require('./validation-error');

function getCurrentValidators() {
  const validatorsDir = join(__dirname, 'validators');
  return readdirSync(validatorsDir).reduce((validators, fileName) => {
    const sanitizedName = fileName.slice(0, -3);
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    return { ...validators, [sanitizedName]: require(`${validatorsDir}/${sanitizedName.substring()}`) };
  }, {});
}

function generateValidatorSchema(taxonomy) {
  const validators = getCurrentValidators();

  return Object
    .keys(taxonomy)
    .reduce((schema, key) => {
      const val = PropertyValidator.build({ field: key, taxonomy: taxonomy[key], validators });
      return { ...schema, [key]: val };
    }, {});
}

class Validator {
  constructor({ taxonomy = {}, options = {} } = {}) {
    this.failFast = !!options.failFast;
    this.schema = generateValidatorSchema(taxonomy);
    this.requiredProperties = Object
      .entries(this.schema)
      .filter(p => !!p[1].required)
      .map(p => p[0]);
  }

  validate(input = null) {
    /* Check if the input is a map object */
    if (input == null || input.constructor !== {}.constructor) {
      throw ValidationError.build({ msg: 'Input must be an object' });
    }

    const missing = this.requiredProperties.filter(p => input[p] === undefined);
    if (missing.length) {
      throw ValidationError.build({ msg: `Required properties missing ${missing.join(', ')}` });
    }

    Object.keys(input).forEach((key) => {
      if (this.schema[key] === undefined) return;

      /* This will automatically throw if there is a validation error */
      /* TODO: Implement a non failFast alternative */
      this.schema[key].validate(input[key]);
    });
  }

  static build({ taxonomy, options }) {
    return new Validator({ taxonomy, options });
  }
}

module.exports = Validator;
