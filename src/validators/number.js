
/*
 * number validator
 * Checks if the specified key is a number.
 * Will trigger an error if the value is null
 * Has the following restrictions:
 *   + range({ min = null, max = null, exactly = null })
 *   + isPositive()
 *   + isInteger()
 *   + oneOf()
 */
const validate = require('validate.js');

const ValidationError = require('../validation-error');

const PRIORITY = 10; /* The lower the more priority it has */

const RESTRICTIONS = {
  range, isPositive, isInteger, oneOf /* eslint-disable-line no-use-before-define */
};

function noop() {}

function isNumber(strict) {
  const libRestriction = { numericality: true };
  if (strict) {
    libRestriction.numericality = { noStrings: true };
  }

  return (input) => {
    if (validate.single(input, libRestriction)) {
      throw new Error('Invalid number');
    }
  };
}

function range({ min = null, max = null, exactly = null } = {}) {
  const taxonomy = {
    numericality: {
      greaterThanOrEqualTo: min,
      lessThanOrEqualTo: max,
      equalTo: exactly
    }
  };
  return (input) => {
    if (validate.single(input, taxonomy)) {
      throw new Error('Invalid number range');
    }
  };
}

function isPositive() {
  return (input) => {
    if (validate.single(input, { numericality: { greaterThanOrEqualTo: 0 } })) {
      throw new Error('Invalid non-positive number');
    }
  };
}

function isInteger() {
  return (input) => {
    if (validate.single(input, { numericality: { onlyInteger: true } })) {
      throw new Error('Invalid non-integer number');
    }
  };
}

function oneOf(array) {
  if (!Array.isArray(array)) throw new ValidationError({ msg: `Invalid taxonomy. ${array} must be an Array` });

  return (input) => {
    if (validate.single(input, { inclusion: array })) {
      throw new Error('Invalid number oneOf');
    }
  };
}

function composeRestrictions(taxonomy, restrictions) {
  const validatorArray = Object
    .keys(taxonomy)
    .reduce((validatorArray, restriction) => {
      if (restrictions[restriction] == null) return validatorArray;
      return [...validatorArray, restrictions[restriction](taxonomy[restriction])];
    }, []);

  /* Add, as the first restriction, the basic number validator
   * We search the strict restriction on the taxonomy so the isNumber method
   * knows if the input can or cannot be coerced from string to number
   */
  validatorArray.unshift(isNumber(taxonomy.strict));
  return (input) => {
    /* Allow undefined values */
    if (input === undefined) return;
    validatorArray.forEach(fn => fn(input));
  };
}

function validatorFactory(taxonomy) {
  /* If the property is falsy do nothing */
  if (!taxonomy) {
    return {
      priority: PRIORITY,
      validate: noop,
    };
  }

  if (taxonomy.constructor !== {}.constructor) {
    return {
      priority: PRIORITY,
      validate: composeRestrictions({}, RESTRICTIONS),
    };
  }

  return {
    priority: PRIORITY,
    validate: composeRestrictions(taxonomy, RESTRICTIONS),
  };
}

module.exports = validatorFactory;
