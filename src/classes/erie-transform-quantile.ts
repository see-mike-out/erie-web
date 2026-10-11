import { DiffingSpec, QuantileSpec } from "../types";
import { deepcopy } from "../util";
import { parseGroupby } from "./erie-util";

export class Quantile {
  _quantile: string;
  _n?: number;
  _step?: number;
  _as?: [string, string];
  _groupby?: string[] | "auto";

  constructor(c: string, n?: number, step?: number, as?: [string, string]) {
    this._quantile = c;
    this._n = n;
    this._step = (step && step > 0 && step < 1) ? step : undefined;
    if (this._n == undefined && this._step == undefined) {
      throw new TypeError("Must specify n or step. ")
    }
    if (as && as.length == this._quantile.length) this._as = as;
  }

  quantile(c: string) {
    this._quantile = c;
    return this;
  }

  as(c: [string, string]) {
    if (c instanceof Array && c.every(d => typeof d == 'string') && c.length == 2) {
      this._as = c;
    } else {
      throw new TypeError("Wrong length/type for qunatile 'as'.")
    }

    return this;
  }

  n(t: number) {
    if (t <= 0) {
      throw new RangeError("N value must be positive integer.")
    }
    this._n = t;
    return this;
  }

  step(t: number) {
    if (0 < t && t < 1) {
      this._step = t;
    } else {
      throw new RangeError("Step value must be between 0 and 1 (exclusive).")
    }
    return this;
  }

  groupby(...args: any) {
    // this function resets groupby
    this._groupby = parseGroupby(...args);
    return this;
  }

  get(): QuantileSpec {
    return {
      quantile: this._quantile,
      as: deepcopy(this._as),
      n: this._n,
      step: this._step,
      groupby: deepcopy(this._groupby)
    };
  }

  clone(): Quantile {
    let _c = new Quantile(this._quantile, this._n, this._step, this._as);
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}