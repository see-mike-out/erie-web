import { DiffingSpec, QuantileSpec } from "../types";
import { deepcopy } from "../util";

export class Quantile {
  _quantile: string;
  _n: number;
  _step: number;
  _as?: [string, string];
  _groupby?: string[];

  constructor(c: string, n: number, step: number, as?: [string, string]) {
    this._quantile = c;
    this._n = n;
    this._step = step;
    if (as) this._as = as;
  }

  quantile(c: string) {
    this._quantile = c;
    return this;
  }

  as(c: [string, string]) {
    if (c instanceof Array && c.every(d => typeof d == 'string') && c.length == 2) {
      this._as = c;
    } else {
      console.error("Wrong length/type for qunatile 'as'.")
    }

    return this;
  }

  n(t: number) {
    this._n = t;
    return this;
  }

  step(t: number) {
    this._step = t;
    return this;
  }

  groupby(...args: any) {
    // this function resets groupby
    if (args.length == 1 &&
      args[0].constructor.name === 'Array' &&
      args[0].every((a: any) => a.constructor.name === 'String')) {
      this._groupby = [...args[0]];
    } else if (args.length >= 1 &&
      args.every((a: any) => a.constructor.name === 'String')) {
      this._groupby = [...args];
    }

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
    _c._groupby = this._groupby;
    return _c;
  }
}