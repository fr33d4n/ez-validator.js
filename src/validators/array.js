
/*
 * array validator
 * - Checks that the input is an array
 * - Has the following possible restrictors:
 *   + length({ min = null, max = null, exactly = null })
 */
const { readdirSync } = require('fs');

const ValidationError = require('../validation-error');

const PRIORITY = 10; /* The lower the more priority it has */

/* eslint-disable-next-line no-use-before-define */
const RESTRICTIONS = { length };

function noop() {}

function isArray() {
  return (input) => {
    if (!Array.isArray(input)) {
      throw ValidationError.build({ msg: 'Invalid array' });
    }
  };
}

function length({ min = null, max = null, exactly = null } = {}) {
  return (input) => {
    if (min != null && input.length < min) throw ValidationError.build({ msg: 'Invalid array length' });
    if (max != null && input.length > max) throw ValidationError.build({ msg: 'Invalid array length' });
    if (exactly != null && input.length !== exactly) throw ValidationError.build({ msg: 'Invalid array length' });
  };
}

function composeArrayRestrictions(taxonomy, restrictions) {
  const validatorArray = Object
    .keys(taxonomy)
    .reduce((validatorArray, restriction) => {
      if (restrictions[restriction] == null) return validatorArray;
      return [...validatorArray, restrictions[restriction](taxonomy[restriction])];
    }, []);

  /* Add, as the first restriction, the basic string validator */
  validatorArray.unshift(isArray());
  return (input) => {
    /* Allow undefined values */
    if (input === undefined) return;
    validatorArray.forEach(fn => fn(input));
  };
}

function getCurrentValidators() {
  return readdirSync(__dirname).reduce((validators, fileName) => {
    const sanitizedName = fileName.slice(0, -3);
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    return { ...validators, [sanitizedName]: require(`${__dirname}/${sanitizedName.substring()}`) };
  }, {});
}

function composeNestedRestrictions(taxonomy) {
  /* Lazy-load this file here to avoid ciclic dependencies error */
  /* eslint-disable-next-line global-require */
  const PropertyValidator = require('../property-validator');
  const validators = getCurrentValidators();
  const nestedValidatorKey = Object
    .keys(taxonomy)
    .find(restriction => !!validators[restriction]);
  if (!nestedValidatorKey) return () => {};

  const nestedValidatorTaxonomy = { [nestedValidatorKey]: taxonomy[nestedValidatorKey] };
  const nestedValidator = PropertyValidator.build({ field: 'array', taxonomy: nestedValidatorTaxonomy, validators });

  return (input) => {
    input.forEach(k => nestedValidator.validate(k));
  };
}

function composeRestrictions(taxonomy, restrictions) {
  const validateArrayFn = composeArrayRestrictions(taxonomy, restrictions);
  const validateNestedFn = composeNestedRestrictions(taxonomy, restrictions);

  return (input) => {
    validateArrayFn(input);
    validateNestedFn(input);
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
