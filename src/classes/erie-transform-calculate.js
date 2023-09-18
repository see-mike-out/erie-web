import { isInstanceOf } from "./erie-util";

export class Calculate {
  constructor(c, a) {
    this._calculate = '';
    this._as;
    if (c) this.calculate(c);
    if (a) this.as(a);
  }

  calculate(c) {
    if (isInstanceOf(c, String)) {
      this._calculate = c;
    } else {
      throw new TypeError("Calculate 'calculate' should be a String.");
    }

    return this;
  }

  as(c) {
    if (isInstanceOf(c, String)) {
      this._as = c;
    } else {
      throw new TypeError("Calculate 'as' should be a String.");
    }

    return this;
  }

  get() {
    return {
      calculate: this._calculate,
      as: this._as
    };
  }

  clone() {
    let _c = new Calculate();
    if (this._calculate) _c.calculate(this._calculate);
    if (this._as) _c.as(this._as);
    return _c;
  }
}