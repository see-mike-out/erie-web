import {
  Datum,
  DataObject,
  DatasetObject
} from "../types";
import { deepcopy } from "../util";
import {
  isInstanceOf
} from "./erie-util";

export const Values = 'values',
  Url = 'url',
  Name = 'name',
  Unset = 'unset';
export type DataType = typeof Values
  | typeof Url
  | typeof Name
  | typeof Unset;
export const AllowedDataTypes = [Values, Url, Name];

export class Data {
  type: DataType;
  values: Datum[] | null;
  url: string | null;
  name: string | null;

  constructor() {
    this.type = 'unset';
    this.values = null;
    this.url = null;
    this.name = null;
  }

  set(type: DataType | Dataset, e: any) {
    if (isInstanceOf(type, Dataset)) {
      this.type = Name;
      this.name = (<Dataset>type)._name;
    } else if (!AllowedDataTypes.includes(<DataType>type)) {
      throw new TypeError(`Unspported data type ${type}}. It must be either one of ${AllowedDataTypes.join(", ")}.`);
    } else {
      if (type === Values) {
        this.type = Values;
        this.values = e;
      } else if (type === Url) {
        this.type = Url;
        this.url = e;
      } else if (type === Name) {
        this.type = Name;
        this.name = e;
      }
    }
    return this;
  }

  get(): DataObject {
    return {
      type: this.type,
      values: deepcopy(this.values),
      url: this.url,
      name: this.name
    }
  }

  clone() {
    let _c = new Data();
    _c.type = this.type;
    if (this.type === Values) {
      _c.values = deepcopy(this.values);
    } else if (this.type === Url) {
      _c.url = this.url;
    } else if (this.type === Name) {
      _c.name = this.name;
    }
    return _c;
  }
}


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