import { FoldObject } from "../types";
import { deepcopy } from "../util";

export class Fold {
  _fold: string[];
  _by: string;
  _exclude: boolean;
  _as: [string, string];

  constructor(f: string[], b: string) {
    this._fold = f;
    this._by = b;
    this._exclude = false;
    this._as = ['key', 'value'];
  }

  fold(f: string[]) {
    this._fold = [...f];
    return this;
  }

  by(b: string) {
    this._by = b;
    return this;
  }

  exclude(e: boolean) {
    this._exclude = e;
    return this;
  }

  as(a: string[]) {
    if (a.length == 2) {
      this._as = [a[0], a[1]];
    } else {
      throw new TypeError("Fold 'fold' should be an Array of two Strings.");
    }

    return this;
  }

  get(): FoldObject {
    return {
      fold: this._fold,
      by: this._by,
      exclude: this._exclude,
      as: this._as
    };
  }

  clone(): Fold {
    let _c = new Fold(this._fold, this._by);
    _c._exclude = this._exclude;
    if (this._as) _c._as = deepcopy(this._as)
    return _c;
  }
}