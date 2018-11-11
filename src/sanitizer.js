
function noop(input) {
  return input;
}

function toNumberTransform(input) {
  return Number(input);
}

function toStringTransform(input) {
  return input.toString();
}

function sanitizeInput(input, transformations) {
  if (input.constructor !== {}.constructor) return input;
  return Object
    .keys(input)
    .reduce((sanitized, k) => {
      if (!transformations[k]) return sanitized;
      sanitized[k] = transformations[k](input[k]);
      return sanitized;
    }, {});
}

function generateArrayTransformations(arrayTaxonomy) {
  /* If the array is has no taxonomy, do nothing to array members */
  if (arrayTaxonomy.constructor !== {}.constructor) return noop;
  /* eslint-disable-next-line no-use-before-define */
  const elementTransform = generateTransformationForKey(arrayTaxonomy);
  return input => input.map(k => elementTransform(k));
}

function generateTransformationForKey(taxonomy) {
  if (taxonomy.constructor !== {}.constructor) throw new Error('Invalid sanitizer taxonomy');

  const taxonomyValidators = Object.keys(taxonomy);
  let i = 0;
  for (; i < taxonomyValidators.length; i++) {
    switch (taxonomyValidators[i]) {
      case 'string':
        return toStringTransform;
      case 'number':
        return toNumberTransform;
      case 'array':
        return generateArrayTransformations(taxonomy.array);
      case 'object': {
        /* eslint-disable-next-line no-use-before-define */
        const objTransformation = generateTransformations(taxonomy.object);
        return input => sanitizeInput(input, objTransformation);
      }
      default:
        break;
    }
  }

  return noop;
}

/* Iterate through every key of the taxonomy, including nested ones
 * and extract any possible transformations from them
 */
function generateTransformations(taxonomy) {
  const transformSchema = {};
  Object.keys(taxonomy).forEach((k) => {
    transformSchema[k] = generateTransformationForKey(taxonomy[k]);
  });
  return transformSchema;
}

class Sanitizer {
  constructor({ taxonomy, options = {} }) {
    if (taxonomy.constructor !== {}.constructor) {
      throw new Error('Invalid sanitizer taxonomy');
    }

    this.ignoreExtraProperties = !!options.ignoreExtraProperties; // TODO
    this.transformations = generateTransformations(taxonomy);
  }

  sanitize(input) {
    return sanitizeInput(input, this.transformations);
  }

  static build(parameters) {
    return new Sanitizer(parameters);
  }
}

module.exports = Sanitizer;
