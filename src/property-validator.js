
const ValidationError = require('./validation-error');

function generateValidatorMethods(taxonomy, validators, options) {
  const valMethods = [];

  Object.keys(taxonomy).forEach((prop) => {
    if (!validators[prop]) return;
    valMethods.push(validators[prop](taxonomy[prop], options));
  });

  valMethods.sort((a, b) => a.priority >= b.priority);
  return valMethods;
}

class PropertyValidator {
  constructor({
    field, taxonomy, validators, options
  }) {
    this.field = field;
    this.valMethods = generateValidatorMethods(taxonomy, validators, options);
  }

  validate(inputValue) {
    try {
      this.valMethods.forEach(m => m.validate(inputValue));
    } catch (e) {
      if (e instanceof ValidationError) {
        e.field = this.field;
        throw e;
      }

      throw new ValidationError(e.message, this.field, inputValue);
    }
  }

  static build({
    field, taxonomy, validators, options
  }) {
    return new PropertyValidator({
      field, taxonomy, validators, options
    });
  }
}

module.exports = PropertyValidator;
