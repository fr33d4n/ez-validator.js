
/*
 * object validator
 * profile: {
 *   object: {
 *     name: {
 *       requiredIf: {
 *         key: 'profile',
 *         condition: '==',
 *         value: true,
 *       },
 *       string: true,
 *     },
 *     age: {
 *       number: {
 *         isInteger: true,
 *         isPositive: true,
 *       },
 *     },
 *   }
  }
 */

const PRIORITY = 10; /* The lower the more priority it has */

function validatorFactory(taxonomy, options) {
  if (!taxonomy || taxonomy.constructor !== {}.constructor) {
    throw new Error('Invalid object taxonomy');
  }

  /* Lazy load the Validator file to avoid circular dependecy error */
  /* eslint-disable-next-line global-require */
  const Validator = require('../validator');
  return {
    priority: PRIORITY,
    validate: (input, allInput) => Validator.build({ taxonomy, options }).validate(input, allInput),
  };
}

module.exports = validatorFactory;
