# Ez Validator.JS
An elegant Node validator/sanitizer for complex and big inputs

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
    integer: {
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
 * Checks if the specified key is present on the input. 
 * Will only trigger an error if the property is not present (`undefined`). 
 * Null values are valid. 
 * The value of this property must be truthy. I recommend `true` or `1`

### string
 * Checks if the specified key is a string.
 * Will trigger an error if the value is null
 * The value of this property must be truthy. If you wanna include restrictions the value must be an object containing those:

Possible restrictions for this validator are:

#### length
 * Its an object with the `min` and `max` properties on it. Must be integers.
 * Both of them are optional.
 * If non of the `min` and `max` properties are present, the restriction will do nothing.
 * Will trigger an error if `min > string.length` or `max < string.length`.  

#### pattern
 * Value must be a valid [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
 * Will trigger an error if the RegExp.test(string) returns false.

#### oneOf
 * Value must be an array of strings. 
 * Checks if the string matches one of the strings on the array
 * Will trigger an error if the string is not on the array

### integer
 * Checks if the specified key is an integer.
 * Will trigger an error if the value is null
 * The value of this property must be truthy. If you wanna include restrictions the value must be an object containing those:

#### range
 * TODO

### float
 * TODO

### array
 * TODO