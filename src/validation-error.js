
class ValidationError extends Error {
  constructor(msg, field, value) {
    this.msg = msg;
    this.field = field;
    this.value = value;
  }

  toString() {
    let msg = `Validation Error: ${this.msg}`;

    if (this.field) {
      msg += ` on property ${this.field}`;
    }

    if (this.value) {
      msg += ` with input value ${this.value}`;
    }

    return msg;
  }
}
