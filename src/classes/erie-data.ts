import {
  Datum,
  DatasetObject,
  DataObject_Typed,
  DatasetSpecItem,
  DataSpec,
  StreamingDataSpec
} from "../types";
import { deepcopy } from "../util";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";

const Values = 'values',
  Url = 'url',
  Name = 'name',
  Unset = 'unset',
  Streaming = 'streaming';
type DataType = typeof Values
  | typeof Url
  | typeof Name
  | typeof Unset
  | typeof Streaming;

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

  private reset() {
    this.type = 'unset';
    this._values = null;
    this._url = null;
    this._name = null;
    this._streaming = false;
    this._test = null;
  }

  set(type: Dataset | DataType | string, v?: any) {
    if (isInstanceOf(type, Dataset)) {
      this.reset();
      this.type = Name;
      this._name = (<Dataset>type)._name;
    } else if (typeof type === 'string' && [Values, Url, Name, Streaming].includes(type) && v !== undefined) {
      if (type === Values) {
        this.values(v);
      } else if (type === Url) {
        this.url(v);
      } else if (type === Name) {
        this._name = type;
        this.type = Name;
      } else if (type === Streaming) {
        this.streaming(v);
      }
    } else if (typeof type === 'string' && !v) {
      this.type = Name;
      this._name = type;
    } else {
      throw new TypeError(`Unsupported data type ${type}.`)
    }
    return this;
  }

  values(v: Datum[]) {
    let values = deepcopy(v);
    if (isArrayOf(values, Object)) {
      this.reset();
      this.type = Values;
      this._values = values;
    } else {
      throw new TypeError("only tidy data can be provided.")
    }
    return this;
  }

  url(v: string) {
    if (typeof v === 'string') {
      this.reset();
      this.type = Url;
      this._url = v;
    } else {
      throw new TypeError("only string-based url can be provided.")
    }
    return this;
  }

  streaming(test?: Datum[] | string) {
    this.type = Streaming;
    this._streaming = true;
    if (typeof test === 'string') {
      this._test = { url: test };
    } else if (isArrayOf(test, Object)) {
      this._test = { values: deepcopy(test as Datum[]) };
    } else if (!test && this._url) {
      // get from those already set
      this._test = { url: this._url }
    } else if (!test && this._values) {
      // get from those already set
      this._test = { values: deepcopy(this._values) }
    } else if (test !== undefined) {
      throw new TypeError("only string-based url or tidy data can be provided for the test data for streaming spec.")
    }
    this._name = null;
    this._url = null;
    this._values = null;
    return this;
  }

  set_streaming_test(test?: Datum[] | string) {
    if (this.type === Streaming) {
      this.streaming(test);
    } else {
      throw new TypeError("Test can only be set for a streaming data. If you want to change the type, then use the `streaming` method instead.")
    }
  }

  get(): DataObject_Typed {
    return {
      type: this.type,
      values: deepcopy(this._values),
      url: this._url,
      name: this._name,
      streaming: this._streaming,
      test: this._test
    }
  }

  toSpec(is_part_of?: boolean): DataSpec | StreamingDataSpec | undefined {
    if (this.type === Values && this._values) {
      return {
        values: deepcopy(this._values)
      }
    } else if (this.type === Url && this._url) {
      return {
        url: this._url
      };
    } else if (this.type === Name && this._name) {
      return {
        name: this._name
      };
    } else if (this.type === Streaming && this._streaming) {
      let o: StreamingDataSpec = {
        stream: this._streaming,
      }
      if (this._test) {
        o.test = deepcopy(this._test);
      }
      return o;
    } else if (is_part_of !== undefined) {
      return undefined
    } else {
      throw new TypeError("The data is unset.")
    }
  }

  clone() {
    let _c = new Data();
    _c.type = this.type;
    _c._values = deepcopy(this._values);
    _c._url = this._url;
    _c._name = this._name;
    _c._streaming = this._streaming;
    _c._test = deepcopy(this._test);
    return _c;
  }
}


export class Datasets {
  datasets: Dataset[];

  constructor() {
    this.datasets = [];
  }

  has(name: string): boolean {
    return (this.get(name) !== undefined);
  }

  add(ds: Dataset) {
    if (this.has(ds._name)) {
      throw new RangeError(`The name ${ds._name} already exists. Try a different name.`);
    } else {
      this.datasets.push(ds.clone());
    }
    return this;
  }

  replace(ds: Dataset) {
    if (!this.has(ds._name)) {
      throw new RangeError(`The name ${ds._name} does not exist.`);
    } else {
      let i = this.datasets.findIndex(d => d._name == ds._name);
      this.datasets[i] = ds.clone();
    }
    return this;
  }

  get(name?: string): DatasetObject | DatasetObject[] | undefined {
    if (name) {
      return this.datasets?.find(d => d._name === name)?.get();
    } else {
      return this.datasets?.map((d) => d.get());
    }
  }

  clone(): Datasets {
    let _c = new Datasets();
    _c.datasets = this.datasets?.map((d) => d.clone());
    return _c;
  }

  toSpec(): DatasetSpecItem[] {
    return this.datasets.map(d => d.toSpec());
  }

  get n_datasets(): number {
    return this.datasets.length;
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

  toSpec(): DatasetSpecItem {
    if (this.data._url && this.data.type === Url) {
      return {
        name: this._name,
        url: this.data._url
      }
    } else if (this.data._values && this.data.type === Values) {
      return {
        name: this._name,
        values: this.data._values
      }
    } else {
      throw new TypeError("The data is unset or unsupported")
    }
  }

  clone(): Dataset {
    let _c = new Dataset(this._name);
    if (_c) _c.data = this.data.clone();
    return _c;
  }
}