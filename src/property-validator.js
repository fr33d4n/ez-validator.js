
const ValidationError = require('./validation-error');

function generateValidatorMethods(taxonomy, validators) {
  const valMethods = [];

  Object.keys(taxonomy).forEach((prop) => {
    if (!validators[prop]) return;
    valMethods.push(validators[prop](taxonomy[prop]));
  });

  valMethods.sort((a, b) => a.priority >= b.priority);
  return valMethods;
}

class PropertyValidator {
  constructor({ field, taxonomy, validators }) {
    this.field = field;
    this.valMethods = generateValidatorMethods(taxonomy, validators);
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

  static build({ field, taxonomy, validators }) {
    return new PropertyValidator({ field, taxonomy, validators });
  }
}

module.exports = PropertyValidator;
