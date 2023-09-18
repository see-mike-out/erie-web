import { Data } from "./erie-data";
import { isInstanceOf } from "./erie-util";

export class Datasets {
  constructor() {
    this.datsets = [];
  }
  add(ds) {
    if (!ds.constructor == Dataset) {
      throw new Error(`Wrong dataset object ${ds.constructor.name}}`);
    }
    this.datsets.push(ds.clone());

    return this;
  }

  get(name) {
    if (name) {
      return this.datasets?.filter(d => d.name === name)?.[0];
    } else {
      return this.datasets?.map((d) => d.get());
    }
  }

  clone() {
    return this.datasets?.map((d) => d.clone());
  }
}

export class Dataset {
  constructor(name) {
    this.name(name);
    this.data = new Data();
    if (!name) {
      throw new Error('A Dataset must be created with a name.')
    }
  }

  name(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError('A name for a Dataset must be String.');
    }
    return this;
  }

  set(t, v) {
    this.data.set(t, v);

    return this;
  }

  get() {
    return {
      name: this._name,
      data: this.data.get()
    }
  }

  clone() {
    let _c = new Dataset(this._name);
    if (_c) _c.data = this.data.clone();
    return _c;
  }
}