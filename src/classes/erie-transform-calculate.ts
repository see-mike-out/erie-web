import { CalculateObject } from "../types";

export class Calculate {
  _calculate: string;
  _as: string;

  constructor(c: string, a: string) {
    this._calculate = c;
    this._as = a;
  }

  calculate(c: string) {
    this._calculate = c;

    return this;
  }

  as(c: string) {
    this._as = c;
    return this;
  }

  get(): CalculateObject {
    return {
      calculate: this._calculate,
      as: this._as
    };
  }

  clone(): Calculate {
    let _c = new Calculate(this._calculate, this._as);
    return _c;
  }
}