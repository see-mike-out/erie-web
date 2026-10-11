import { deepcopy } from "../util";
import { CalculateObject } from "../types";
import { parseGroupby } from "./erie-util";

export class Calculate {
  _calculate: string;
  _as: string;
  _groupby?: string[] | "auto";

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

  groupby(...args: any) {
    // this function resets groupby
    this._groupby = parseGroupby(...args);
    return this;
  }

  get(): CalculateObject {
    return {
      calculate: this._calculate,
      as: this._as,
      groupby: deepcopy(this._groupby)
    };
  }

  clone(): Calculate {
    let _c = new Calculate(this._calculate, this._as);
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}