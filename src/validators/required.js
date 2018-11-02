
const PRIORITY = 0; /* The lower the more priority it has */

function noop() {}

function requiredValidation(input) {
  if (input == null) throw new Error('Required');
}

function validatorFactory(isActive) {
  /* If the property is like required: false dont do a thing. */
  if (!isActive) {
    return {
      priority: PRIORITY,
      validate: noop,
    };
  }

  return {
    priority: PRIORITY,
    validate: requiredValidation,
  };
}

module.exports = validatorFactory;
