
class ValidationError extends Error {
  constructor(msg, field, value) {
    super();
    this.msg = msg;
    this.field = field;
    this.value = value;
  }

  toString() {
    let msg = 'Validation Error';

    if (this.msg) {
      msg += `: ${this.msg}`;
    }

    if (this.field) {
      msg += ` on property ${this.field}`;
    }

    if (this.value) {
      msg += ` with input value ${this.value}`;
    }

    return msg;
  }

  static build({ msg, field, value } = {}) {
    return new ValidationError(msg, field, value);
  }
}

module.exports = ValidationError;
