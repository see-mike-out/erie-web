import { FilterObject } from "../types/transform";

export class Filter {
  _filter: string;

  constructor(filter: string) {
    this._filter = filter;
  }

  filter(f: string) {
    this._filter = f;
    return this;
  }

  get(): FilterObject {
    return {
      filter: this._filter
    };
  }

  clone(): Filter {
    let _c = new Filter(this._filter);
    return _c;
  }
}