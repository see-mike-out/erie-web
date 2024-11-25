import {
  SampledToneObject,
  SamplingItem
} from "../types";
import { deepcopy } from "../util";

function scaleKeyCheck(key: string): any {
  return key.match(/^[C][0-7]$/);
}

export class SampledTone {
  _name: string;
  _sample?: SamplingItem;

  constructor(name: string, s: SamplingItem) {
    this._name = name;
    this._sample;
    this.setName(name);
    this.setSample(s);
  }

  setName(n: string) {
    this._name = n;
    return this;
  }

  setSample(s: SamplingItem) {
    Object.keys(s).forEach((k) => {
      if (!scaleKeyCheck(k) || k === undefined) {
        throw new TypeError('The key of a sampling object should be "C" + "0-7".');
      } else if (k === "mono") {
        this._sample = { mono: s[k] };
      } else {
        this._sample = {};
        let ck = <keyof SamplingItem>k;
        this._sample[ck] = s[ck];
      }
    });

    return this;
  }

  get(): SampledToneObject {
    return {
      name: this._name,
      sample: deepcopy(this._sample || {})
    }
  }

  clone(): SampledTone {
    let _c = new SampledTone(this._name, deepcopy(this._sample || {}));
    return _c;
  }
}

export class Sampling {
  sampling: SampledTone[];

  constructor() {
    this.sampling = [];
  }

  add(a: SampledTone) {
    this.sampling.push(a);
    return this;
  }

  get(): SampledToneObject[] {
    return this.sampling.map((d) => d.get());
  }

  clone(): Sampling {
    let _c = new Sampling();
    _c.sampling = this.sampling.map((d) => d.clone());

    return _c;
  }
}