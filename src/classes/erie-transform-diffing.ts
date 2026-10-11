import { DiffingSpec } from "../types";
import { deepcopy } from "../util";
import { parseGroupby } from "./erie-util";

export class Diffing {
  _diffing: string[];
  _carryOver?: boolean;
  _keepFirstAsZero?: boolean;
  _as?: string[];
  _groupby?: string[] | "auto";

  constructor(c: string[], carryOver?: boolean, keepFirstAsZero?: boolean, a?: string[]) {
    this._diffing = c;
    if (a) this._as = a;
    this._carryOver = carryOver ?? true;
    this._keepFirstAsZero = keepFirstAsZero ?? true;
  }

  diffing(c: string[]) {
    this._diffing = c;
    return this;
  }

  as(c: string[]) {
    if (c.length !== this._diffing.length) {
      throw new TypeError("The length of `as` must be the same with that of the diffing fields.");
    }
    this._as = c;
    return this;
  }

  carryOver(t: boolean) {
    this._carryOver = t;
    return this;
  }

  keepFirstAsZero(t: boolean) {
    this._keepFirstAsZero = t;
    return this;
  }

  groupby(...args: any) {
    // this function resets groupby
    this._groupby = parseGroupby(...args);
    return this;
  }

  get(): DiffingSpec {
    return {
      diffing: deepcopy(this._diffing),
      as: deepcopy(this._as),
      carryOver: this._carryOver,
      keepFirstAsZero: this._keepFirstAsZero,
      groupby: deepcopy(this._groupby)
    };
  }

  clone(): Diffing {
    let _c = new Diffing(this._diffing, this._carryOver, this._keepFirstAsZero, this._as);
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}