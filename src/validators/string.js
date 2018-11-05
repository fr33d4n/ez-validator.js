
/*
 * string validator
 * - Checks that the input is a string
 * - Has the following possible restrictors:
 *   + length({ min = null, max = null, exactly = null })
 *   + pattern(regExp)
 *   + oneOf(array)
 */
const validate = require('validate.js');

const ValidationError = require('../validation-error');

const PRIORITY = 10; /* The lower the more priority it has */

/* eslint-disable-next-line no-use-before-define */
const RESTRICTIONS = { length, pattern, oneOf };

function noop() {}

function isString() {
  return (input) => {
    if (!validate.isString(input)) {
      throw new Error('Invalid string');
    }
  };
}

function length({ min = null, max = null, exactly = null } = {}) {
  return (input) => {
    if (validate.single(input, { length: { minimum: min, maximum: max, is: exactly } })) {
      throw new Error('Invalid string length');
    }
  };
}

function pattern(regex) {
  if (!(regex instanceof RegExp)) throw new ValidationError({ msg: `Invalid taxonomy. ${regex} must be a RegExp` });

  return (input) => {
    if (validate.single(input, { format: regex })) {
      throw new Error('Invalid string pattern');
    }
  };
}

function oneOf(array) {
  if (!Array.isArray(array)) throw new ValidationError({ msg: `Invalid taxonomy. ${array} must be an Array` });

  return (input) => {
    if (validate.single(input, { inclusion: array })) {
      throw new Error('Invalid string oneOf');
    }
  };
}

function composeRestrictions(taxonomy, restrictions) {
  const validatorArray = Object.keys(taxonomy).reduce((validatorArray, restriction) => {
    if (restrictions[restriction] == null) return validatorArray;
    return [...validatorArray, restrictions[restriction](taxonomy[restriction])];
  }, []);

  /* Add, as the first restriction, the basic string validator */
  validatorArray.unshift(isString());
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
