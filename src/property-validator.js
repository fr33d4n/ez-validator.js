
const validate = require('validate.js');
const ValidationError = require('./validation-error');

class PropertyValidator {
  constructor({ taxonomy }) {
  }

  static build({ taxonomy }) {
    return new PropertyValidator({ taxonomy });
  }
}
