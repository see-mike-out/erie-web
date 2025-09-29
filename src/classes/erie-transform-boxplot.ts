import { BoxplotSpec } from "../types";
import { deepcopy } from "../util";

export class Boxplot {
  _boxplot: string;
  _extent?: number | 'min-max'
  _invalid?: 'filter' | undefined;

  _groupby?: string[];

  constructor(c: string, extent?: number | 'min-max', invalid?: 'filter' | undefined) {
    this._boxplot = c;
    this._extent = extent;
    this._invalid = invalid;
  }

  boxplot(c: string) {
    this._boxplot = c;
    return this;
  }

  extent(t: number | 'min-max') {
    this._extent = t;
    return this;
  }

  invalid(t: 'filter' | undefined) {
    this._invalid = t;
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

  get(): BoxplotSpec {
    return {
      boxplot: this._boxplot,
      extent: this._extent,
      invalid: this._invalid,
      groupby: deepcopy(this._groupby)
    };
  }

  clone(): Boxplot {
    let _c = new Boxplot(this._boxplot, this._extent, this._invalid);
    _c._groupby = this._groupby;
    return _c;
  }
}