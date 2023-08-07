import { deepcopy } from "./erie-util";

export class Bin {
  constructor(bin) {
    this._bin = bin;
    this._as = bin + "__bin";
    this._end = bin + "__bin_end";
    this._nice = true;
    this._maxbins = 10;
    this._step;
    this._exact;
  }

  as(start, end) {
    if (start?.constructor.name === 'String' && end?.constructor.name === 'String') {
      this._as = start;
      this._end = end;
    } else {
      throw new TypeError("Bin 'as' (start, end) value should be Strings")
    }

    return this;
  }

  nice(v) {
    if (v?.constructor.name === 'Boolean') {
      this._nice = v;
    } else {
      throw new TypeError("Bin 'nice' value should be Boolean");
    }

    return this;
  }

  maxbins(v) {
    if (v?.constructor.name === 'Number' && Math.round(v) == v) {
      this._maxbins = v;
    } else {
      throw new TypeError("Bin 'maxbins' should be an integer.");
    }

    return this;
  }

  step(v) {
    if (v?.constructor.name === 'Number') {
      this._step = v;
    } else {
      throw new TypeError("Bin 'step' value should be a Number");
    }

    return this;
  }

  exact(v) {
    if (v?.constructor.name === 'Array' && v.every((d) => d.constructor.name === 'Number')) {
      this._exact = v;
    } else {
      throw new TypeError("Bin 'exact; value should be an array of Numbers.");
    }

    return this;
  }

  get() {
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

  clone() {
    let _c = new Bin(this._bin);
    _c._as = this._as;
    _c._end = this._end;
    _c._nice = this._nice;
    _c._maxbins = this._maxbins;
    _c._step = this._step;
    _c._exact = [...this._exact];
    return _c;
  }
}