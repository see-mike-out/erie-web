import { deepcopy, isInstanceOf } from "./erie-util";


function scaleKeyCheck(key) {
  return key.match(/^[C][0-7]$/);
}

export class SampledTone {
  constructor(name, s) {
    this._name;
    this._sample = {};
    if (!name) {
      throw new Error('A sampled tone must have a name.')
    }
    if (!s) {
      throw new Error('A sampled tone must have a sampling object.')
    }
    this.setName(name);
    this.setSample(s);
  }

  setName(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError('The name of a sampled tone must be String.');
    }

    return this;
  }

  setSample(s) {
    Object.keys(s).forEach((k) => {
      if (k === "mono") {
        this._sample.mono = s[k];
      } else if (!scaleKeyCheck(k)) {
        throw new TypeError('The key of a sampling object should be "C" + "0-7".');
      } else {
        this._sample[k] = s[k];
      }
    });

    return this;
  }

  get() {
    return {
      name: this._name,
      sample: deepcopy(this._sample || {})
    }
  }

  clone() {
    let _c = new SampledTone(this._name, deepcopy(this._sample || {}));

    return _c;
  }
}

export class Sampling {
  constructor() {
    this.sampling = [];
  }

  add(a) {
    if (isInstanceOf(a, SampledTone)) {
      this.sampling.push(a);
    } else {
      throw new TypeError('A sampled tone must be created using SampledTone class.');
    }

    return this;
  }

  get() {
    return this.sampling.map((d) => d.get());
  }

  clone() {
    let _c = new Sampling();
    _c.sampling = this.sampling.map((d) => d.clone());

    return _c;
  }
}