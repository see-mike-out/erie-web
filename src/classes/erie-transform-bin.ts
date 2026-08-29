import { BinObject } from "../types";
import { deepcopy } from "../util";

export class Bin {
  _bin: string;
  _as: string;
  _end: string;
  _nice?: boolean;
  _maxbins?: number;
  _step?: number;
  _exact?: number[];

  constructor(bin: string) {
    this._bin = bin;
    this._as = bin + "__bin";
    this._end = bin + "__bin_end";
    this._nice = true;
    this._maxbins = 10;
    this._step;
    this._exact;
  }

  as(start: string, end: string) {
    this._as = start;
    this._end = end;

    return this;
  }

  nice(v: boolean) {
    this._nice = v;

    return this;
  }

  maxbins(v: number) {
    if (Math.round(v) == v) {
      this._maxbins = v;
    } else {
      throw new TypeError("Bin 'maxbins' should be an integer.");
    }

    return this;
  }

  step(v: number) {
    this._step = v;
    return this;
  }

  exact(v: number[]) {
    this._exact = v;

    return this;
  }

  get(): BinObject {
    return {
      bin: this._bin,
      as: this._as,
      end: this._end,
      nice: this._nice,
      maxbins: this._maxbins,
      step: this._step,
      exact: deepcopy(this._exact)
    };
  }

  clone(): Bin {
    let _c = new Bin(this._bin);
    _c._as = this._as;
    _c._end = this._end;
    _c._nice = this._nice;
    _c._maxbins = this._maxbins;
    _c._step = this._step;
    _c._exact = this._exact ? [...this._exact] : undefined;
    return _c;
  }
}