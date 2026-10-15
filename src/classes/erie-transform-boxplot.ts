import { BoxplotSpec } from "../types";
import { deepcopy } from "../util";
import { parseGroupby } from "./erie-util";

export class Boxplot {
  _boxplot: string;
  _extent?: number | 'min-max'
  _invalid?: 'filter' | undefined;

  _groupby?: string[] | "auto";

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
    if ((typeof t === "number" && t > 0) || t === "min-max") {
      this._extent = t;
    } else {
      throw new TypeError(`Unsupported extent value: ${t}`)
    }

    return this;
  }

  invalid(t: 'filter' | undefined) {
    this._invalid = t;
    return this;
  }

  groupby(...args: any) {
    // this function resets groupby
    this._groupby = parseGroupby(...args);
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
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}