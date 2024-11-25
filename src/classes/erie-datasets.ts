import { DatasetObject } from "../types";
import {
  Data,
  DataType
} from "./erie-data";

export class Datasets {
  datasets: Dataset[];

  constructor() {
    this.datasets = [];
  }

  add(ds: Dataset) {
    this.datasets.push(ds.clone());

    return this;
  }

  get(name?: string): DatasetObject | DatasetObject[] {
    if (name) {
      return this.datasets?.filter(d => d._name === name)?.[0].get();
    } else {
      return this.datasets?.map((d) => d.get());
    }
  }

  clone(): Datasets {
    let _c = new Datasets();
    _c.datasets = this.datasets?.map((d) => d.clone());
    return _c;
  }
}

export class Dataset {
  _name: string;
  data: Data;

  constructor(n: string) {
    this._name = n;
    this.data = new Data();
  }

  name(n: string) {
    this._name = n;
    return this;
  }

  set(t: DataType, v: any) {
    this.data.set(t, v);

    return this;
  }

  get(): DatasetObject {
    return {
      name: this._name,
      data: this.data.get()
    }
  }

  clone(): Dataset {
    let _c = new Dataset(this._name);
    if (_c) _c.data = this.data.clone();
    return _c;
  }
}