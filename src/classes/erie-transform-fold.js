import { deepcopy, isInstanceOf } from "./erie-util";

export class Fold {
  constructor(f, b) {
    this._fold = [];
    this._by;
    this._exclude = false;
    this._as = ['key', 'value'];
    if (f) this.fold(f);
    if (b) this.by(b);
  }

  fold(f) {
    if (isInstanceOf(f, Array) && f.every((d) => isInstanceOf(d, String))) {
      this._fold = [...f];
    } else {
      throw new TypeError("Fold 'fold' should be an Array of Strings.");
    }

    return this;
  }

  by(b) {
    if (isInstanceOf(b, String)) {
      this._by = b;
    } else {
      throw new TypeError("Fold 'by' should be a String.");
    }

    return this;
  }

  exclude(e) {
    if (isInstanceOf(e, Boolean)) {
      this._exclude = e;
    } else {
      throw new TypeError("Fold 'exclude' should be Boolean.");
    }

    return this;
  }

  as(a) {
    if (isInstanceOf(a, Array) &&
      a.length == 2 &&
      a.every((d) => isInstanceOf(d, String))) {
      this._as = [...a];
    } else {
      throw new TypeError("Fold 'fold' should be an Array of two Strings.");
    }

    return this;
  }

  get() {
    return {
      fold: this._fold,
      by: this._by,
      exclude: this._exclude,
      as: this._as
    };
  }

  clone() {
    let _c = new Fold();
    if (this._fold) _c._fold = deepcopy(this._fold);
    if (this._by) _c._by = deepcopy(this._by);
    if (this._exclude) _c._exclude = deepcopy(this._exclude);
    if (this._as) _c._as = deepcopy(this._as)
    return _c;
  }
}