import { isInstanceOf } from "./erie-util";

export class Filter {
  constructor(filter) {
    this._filter = '';
    this.filter(filter);
  }

  filter(f) {
    if (isInstanceOf(f, String)) {
      this._filter = f;
    } else {
      throw new TypeError("Filter 'filter' should be a String.");
    }

    return this;
  }

  get() {
    return {
      filter: this._filter
    };
  }

  clone() {
    let _c = new Filter(this._filter);
    return _c;
  }
}