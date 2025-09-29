import { DiffingSpec } from "../types";
import { deepcopy } from "../util";

export class Diffing {
  _diffing: string[];
  _carryOver?: boolean;
  _keepFirstAsZero?: boolean;
  _as?: string[];
  _groupby?: string[];

  constructor(c: string[], a?: string[], carryOver?: boolean, keepFirstAsZero?: boolean) {
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
    let _c = new Diffing(this._diffing, this._as, this._carryOver, this._keepFirstAsZero);
    _c._groupby = this._groupby;
    return _c;
  }
}