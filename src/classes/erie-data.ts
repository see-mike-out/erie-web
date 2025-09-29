import {
  Datum,
  DataObject,
  DatasetObject
} from "../types";
import { deepcopy } from "../util";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";

export const Values = 'values',
  Url = 'url',
  Name = 'name',
  Unset = 'unset',
  Streaming = 'streaming';
export type DataType = typeof Values
  | typeof Url
  | typeof Name
  | typeof Unset
  | typeof Streaming;
export const AllowedDataTypes = [Values, Url, Name, Streaming];

export class Data {
  type: DataType;
  _values: Datum[] | null;
  _url: string | null;
  _name: string | null;
  _streaming: boolean;
  _test: { url: string } | { values: Datum[] } | null;

  constructor() {
    this.type = 'unset';
    this._values = null;
    this._url = null;
    this._name = null;
    this._streaming = false;
    this._test = null;
  }

  set(type: DataType | Dataset, e: any) {
    if (isInstanceOf(type, Dataset)) {
      this.type = Name;
      this._name = (<Dataset>type)._name;
      // cancel others
      this._values = null;
      this._url = null;
      this._name = null;
      this._streaming = false;
      this._test = null;
    } else {
      console.warn("data.set method is only for a dataset object.")
    }
    return this;
  }

  values(v: Datum[]) {
    if (isArrayOf(v, Object)) {
      this.type = Values;
      this._values = deepcopy(v);
      // cancel others
      this._name = null;
      this._url = null;
      this._name = null;
      this._streaming = false;
      this._test = null;
    } else {
      console.warn("only tidy data can be provided.")
    }
    return this;
  }

  url(v: string) {
    if (typeof v === 'string') {
      this.type = Values;
      this._url = v;
      // cancel others
      this._values = null;
      this._name = null;
      this._name = null;
      this._streaming = false;
      this._test = null;
    } else {
      console.warn("only string-based url can be provided.")
    }
    return this;
  }

  streaming(test?: Datum[] | string) {
    this.type = Streaming;
    this._name = null;
    this._name = null;
    this._streaming = true;
    if (typeof test === 'string') {
      this._test = { url: test };
    } else if (isArrayOf(test, Object)) {
      this._test = { values: deepcopy(test as Datum[]) };
    } else if (this._url) {
      // get from those already set
      this._test = { url: this._url }
    } else if (this._values) {
      // get from those already set
      this._test = { values: deepcopy(this._values) }
    } else {
      console.warn("only string-based url or tidy data can be provided for the test data for streaming spec.")
    }
    this._url = null;
    this._values = null;
    return this;
  }

  get(): DataObject {
    return {
      type: this.type,
      values: deepcopy(this._values),
      url: this._url,
      name: this._name,
      streaming: this._streaming,
      test: this._test
    }
  }

  clone() {
    let _c = new Data();
    _c.type = this.type;
    if (this.type === Values) {
      _c._values = deepcopy(this._values);
    } else if (this.type === Url) {
      _c._url = this._url;
    } else if (this.type === Name) {
      _c._name = this._name;
    } else if (this.type === Streaming) {
      _c._streaming = this._streaming;
      _c._test = deepcopy(this._test);
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