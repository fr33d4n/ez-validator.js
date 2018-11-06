
const PRIORITY = 0; /* The lower the more priority it has */

const ValidationError = require('../validation-error');

const ALLOWED_COMPARE_OPERATORS = ['===', '!==', '==', '!=', '>', '<', '>=', '<=', 'oneOf', 'notOneOf'];

function triEq(value) {
  return input => input === value;
}

function triNEq(value) {
  return input => input !== value;
}

function dbEq(value) {
  return input => input == value;
}

function dbNEq(value) {
  return input => input != value;
}

function gt(value) {
  return input => input > value;
}

function gte(value) {
  return input => input >= value;
}

function lt(value) {
  return input => input < value;
}

function lte(value) {
  return input => input <= value;
}

function oneOf(value) {
  return input => value.indexOf(input) !== -1;
}

function notOneOf(value) {
  return input => value.indexOf(input) === -1;
}


function getCompareMethod(condition, value) {
  switch (condition) {
    case '===':
      return triEq(value);
    case '!==':
      return triNEq(value);
    case '==':
      return dbEq(value);
    case '!=':
      return dbNEq(value);
    case '>':
      return gt(value);
    case '>=':
      return gte(value);
    case '<':
      return lt(value);
    case '<=':
      return lte(value);
    case 'oneOf':
      return oneOf(value);
    case 'notOneOf':
      return notOneOf(value);
    default:
      throw new Error('Invalid requiredIf taxonomy');
  }
}
/* Taxonomy is something like:
 * {
 *   key: 'gender',
 *   condition: '==='
 *   value: 'male',
 * }
 */
function composeValidation(taxonomy) {
  if (!taxonomy.key || ALLOWED_COMPARE_OPERATORS.indexOf(taxonomy.condition) === -1) {
    throw new Error('Invalid requiredIf taxonomy');
  }

  /* We generate this method once and before the app begins working, so validation is faster */
  const compareFn = getCompareMethod(taxonomy.condition, taxonomy.value);
  return (input, allInput) => {
    if (input == null && compareFn(allInput[taxonomy.key])) throw ValidationError.build({ msg: 'Required' });
  };
}

function validatorFactory(taxonomy) {
  if (!taxonomy || {}.constructor !== taxonomy.constructor) {
    throw new Error('Invalid requiredIf taxonomy');
  }

  return {
    priority: PRIORITY,
    validate: composeValidation(taxonomy),
  };
}

module.exports = validatorFactory;
