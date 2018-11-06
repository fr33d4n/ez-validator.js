# Ez Validator.JS
An elegant Node validator/sanitizer for complex and big inputs

[![Build Status](https://travis-ci.org/fr33d4n/ez-validator.js.svg?branch=master)](https://travis-ci.org/fr33d4n/ez-validator.js) [![codecov](https://codecov.io/gh/fr33d4n/ez-validator.js/branch/master/graph/badge.svg)](https://codecov.io/gh/fr33d4n/ez-validator.js)

## Installation
```sh
npm install ez-validator --save
```

## Basic usage
This is a basic example on how to define and use the validator.

```js
const FILM_GENERES: [
  'Sci-Fi',
  'Action',
  'Romance',
  'Thriller',
  'Comedy',
];

const taxonomy = {
  name: {
    required: true,
    string: {
      length: { min: 3, max: 255 },
      pattern: /^[a-zA-Z0-9\_\-\b]*
    }
  },
  year: {
    required: true,
    number: {
      strict: true,
      integer: true,
      range: { min: 1900 }
    }
  },
  generes: {
    array: {
      length: { max: 3 },
      string: {
        oneOf: FILM_GENERES,
      }
    },
  }
}

const options = {
  failFast: true
};

const { Validator } = require('ez-validator');
const filmValidator = Validator.build({ taxonomy, options });

function createFilm(req, res, next) {
  try {
    filmValidator.validate(req.body);
  } catch(e) {
    return res.send(400, 'Validation error');
  }
}
```

## Validators
As shown on the example code just above, you must define the validation rules on a JSON object. This object keys must be named after the expected keys of the input to be validated. In the example, we were validating 3 properties. `name`, `year` and `generes`. Each property has it's own validation schema. The schema MUST be an object as well, and may be empty. Here is a full list of the validation options:

### required
 * Checks if the specified key is present AND not null on the input. 
 * The value of this property on the taxonomy must be truthy. I recommend `true` or `1`

```js
const options = {};
const taxonomy = {
  name: {
    required: true
  }
}

const { Validator } = require('ez-validator');
const filmValidator = Validator.build({ taxonomy, options });

filmValidator.validate(); // throws Error
filmValidator.validate({ age: 30 }); // throws Error
filmValidator.validate({ name: null }); // throws Error
filmValidator.validate({ name: 'john' }); // OK
```

### requiredIf
 * Checks if the specified key is present AND not null on the input AND a certain condition is true. 
 * The value of the validator must be an object with the mandatory properties `key`, `value` and `condition`.
 * `key` should be the name of another attribute of the taxonomy
 * `condition` is the comparison operator which will be used to test the input `key` against the value you specify
 * `condition` must be one of the following ones: ['===', '!==', '==', '!=', '>', '<', '>=', '<=', 'oneOf', 'notOneOf']
 * TODO: Multiple requiredIf conditions, more comparison operators

```js
const options = {};
const taxonomy = {
  gender: {
    string: {
      oneOf: ['male', 'female']
    }
  },
  age: {
    requiredIf: {
      key: 'gender',
      condition: '==='
      value: 'male',
    },
    number: {
      range: { min: 18, max: 99 }
    }
  }
}

const { Validator } = require('ez-validator');
const filmValidator = Validator.build({ taxonomy, options });

filmValidator.validate({ }); // OK
filmValidator.validate({ age: 30 }); // OK
filmValidator.validate({ gender: 'male', age: 30 }); // OK
filmValidator.validate({ gender: 'male' }); // throws Error
filmValidator.validate({ gender: 'female' }); // OK
```

### string
 * Checks if the specified key is a string.
 * Will trigger an error if the input value is null
 * Will NOT trigger an error if the input value is not present (`undefined`). This use case is covered by the `required` validator.
 * The value of this property must be truthy. If you wanna include restrictions the value must be an object containing those:

 ```js
 const options = {};
 const taxonomy = {
   name: {
     string: true
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ name: 'john' }); // OK
 filmValidator.validate({ name: null }); // throws Error
 filmValidator.validate({ name: 123 }); // throws Error
 ```

Possible restrictions for this validator are:

#### length
 * Its an object with the `min`, `max` and `exactly` properties on it. Must be integers.
 * All of them are optional.
 * If non of properties are present, the restriction will do nothing.
 * Will trigger an error if `min > string.length`, `max < string.length` or `string.length !== exactly`.  

 ```js
 const options = {};
 const taxonomy = {
   name: {
     string: {
       length: { min: 1, max: 5 }
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ name: 'john' }); // OK
 filmValidator.validate({ name: '' }); // throws Error
 filmValidator.validate({ name: 'some random large name' }); // throws Error
 ```

#### pattern
 * Value must be a valid [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
 * Will trigger an error if the RegExp.test(string) returns false.

 ```js
 const options = {};
 const taxonomy = {
   name: {
     string: {
       pattern: /^Mr\.\b[A-Z].[a-z]*$/
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ name: 'Mr. Random' }); // OK
 filmValidator.validate({ name: 'Random' }); // throws Error
 filmValidator.validate({ name: 'Mr. 9S' }); // throws Error
 ```

#### oneOf
 * Value must be an array of strings. 
 * Checks if the string matches one of the strings on the array
 * Will trigger an error if the string is not on the array

 ```js
 const options = {};
 const taxonomy = {
   primaryColor: {
     string: {
       oneOf: ['cyan', 'magenta', 'yellow']
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ primaryColor: 'cyan' }); // OK
 filmValidator.validate({ primaryColor: 'magenta' }); // OK
 filmValidator.validate({ primaryColor: 'green' }); // throws Error
 filmValidator.validate({ primaryColor: 'black' }); // throws Error
 ```

### number
 * Checks if the specified key is a number. If the `strict` restriction is set, the validator will not coerce strings to numbers, and so, strings that represent numbers (i.e: `'10'`) will throw. 
 * Will trigger an error if the value is null
 * The value of this property must be truthy. 

 ```js
 const options = {};
 const taxonomy = {
   year: {
     number: true
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ year: null }); // throws Error
 filmValidator.validate({ year: 1925 }); // OK
 filmValidator.validate({ year: '1925' }); // OK

 const strictTaxonomy = {
   name: {
     number: {
       strict: true
     }
   }
 }

 const strictFilmValidator = Validator.build({ taxonomy, options });

 strictFilmValidator.validate({ year: 1925 }); // OK
 strictFilmValidator.validate({ name: '1925' }); // throws Error
 ```

If you wanna include restrictions the value must be an object containing those:

#### range
 * Its an object with the `min`, `max` and `exactly` properties on it. Must be integers.
 * All of them are optional.
 * If non of properties are present, the restriction will do nothing.
 * Will trigger an error if `min > number.length`, `max < number.length` or `number.length !== exactly`.

 ```js
 const options = {};
 const taxonomy = {
   year: {
     number: {
       range: { min: 2000, max: 2018 }
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ year: 1995 }); // throws Error
 filmValidator.validate({ year: 2010 }); // OK
 ```

#### isPositive
 * Checks if the input is a positive number (+= 0)

 ```js
 const options = {};
 const taxonomy = {
   year: {
     number: {
       isPositive: true
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ year: -1 }); // throws Error
 filmValidator.validate({ year: 0 }); // OK
 filmValidator.validate({ year: 1995 }); // OK
 ```

#### isInteger
  * Checks if the input is an integer number.

  ```js
  const options = {};
  const taxonomy = {
    year: {
      number: {
        isInteger: true
      }
    }
  }

  const { Validator } = require('ez-validator');
  const filmValidator = Validator.build({ taxonomy, options });

  filmValidator.validate({ }); // OK
  filmValidator.validate({ year: -1 }); // OK
  filmValidator.validate({ year: 0 }); // OK
  filmValidator.validate({ year: 3.14 }); // throws Error
  ```

#### oneOf
 * Value must be an array of numbers. 
 * Checks if the number matches one of the numbers on the array
 * Will trigger an error if the number is not on the array

 ```js
 const options = {};
 const taxonomy = {
   binaryNumbers: {
     number: {
       oneOf: [1, 2, 4, 8, 16]
     }
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ binaryNumbers: 1 }); // OK
 filmValidator.validate({ binaryNumbers: 8 }); // OK
 filmValidator.validate({ binaryNumbers: 9 }); // throws Error
 filmValidator.validate({ binaryNumbers: 32 }); // throws Error
 ```

### array
 * Checks if the specified key is an array. 
 * You can combine this validator with other validators to perform nested checks

 ```js
 const options = {};
 const taxonomy = {
   categories: {
     array: true
   }
 }

 const { Validator } = require('ez-validator');
 const filmValidator = Validator.build({ taxonomy, options });

 filmValidator.validate({ }); // OK
 filmValidator.validate({ categories: null }); // throws Error
 filmValidator.validate({ categories: [] }); // OK
 filmValidator.validate({ categories: [ 'Terror', 12 ] }); // OK

 const nestedTaxonomy = {
   categories: {
     array: {
       string: {
         length: { min: 3, max: 10 },
       }
     }
   }
 }

 const strictFilmValidator = Validator.build({ taxonomy: nestedTaxonomy, options });

 strictFilmValidator.validate({ categories: [ ] }); // OK
 strictFilmValidator.validate({ categories: [ 'a' ] }); // throws Error
 strictFilmValidator.validate({ categories: [ '12345678901' ] }); // throws Error
 strictFilmValidator.validate({ categories: [ '123', '1234567890' ] }); // OK
 ```

You can also include the following restrictions:

#### length
 * Its an object with the `min`, `max` and `exactly` properties on it. Must be integers.
 * All of them are optional.
 * If non of properties are present, the restriction will do nothing.
 * Will trigger an error if `min > array.length`, `max < array.length` or `array.length !== exactly`.  

 ```js
 const options = {};
 const taxonomy = {
   categories: {
     array: {
       length: { min: 1, max: 3 },
       string: {
         length: { min: 3, max: 10 },
       }
     }
   }
 }

 const strictFilmValidator = Validator.build({ taxonomy, options });

 strictFilmValidator.validate({ categories: [ ] }); // throws Error
 strictFilmValidator.validate({ categories: [ 'Terror', 'Sci-Fi', 'Thriller', 'Anime' ] }); // throws Error
 strictFilmValidator.validate({ categories: [ 'Terror' ] }); // OK
 strictFilmValidator.validate({ categories: [ 'a' ] }); // throws Error
 ```

### object
 * Performs a nested validationof the JSON object
 * You can have as many nested objects as you want

```js
const options = {};
const taxonomy = {
  profile: {
    object: {
      name: {
        requiredIf: {
          key: 'profile',
          condition: '==',
          value: true,
        },
        string: true,
      },
      age: {
        number: {
          isInteger: true,
          isPositive: true,
        },
      },
    }
  },
  skills: {
    array: {
      string: true
    }
  }
}

const { Validator } = require('ez-validator');
const filmValidator = Validator.build({ taxonomy, options });

filmValidator.validate({ }); // OK
filmValidator.validate({ profile: { age: 23 } }); // throws Error
filmValidator.validate({ profile: { name: 'john', age: 23 } }); // OK
filmValidator.validate({ profile: { name: 'john' } }); // OK
filmValidator.validate({ profile: { name: 'john', age: 3.14 } }); // throws Error
```
