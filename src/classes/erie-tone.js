import { SynthTone } from "./erie-synth";
import { SampledTone } from "./erie-sampling";
import { isArrayOf, isInstanceOf } from "./erie-util";
import { WaveTone } from "./erie-wave";




export class Tone {
  constructor(type, c) {
    this._type = 'default';
    this._continued = false;
    if (type) this.set(type);
    else this.set("default")
    if (c !== undefined) this.continued(c);
    this._filter = [];
  }

  set(t) {
    if (isInstanceOf(t, SampledTone)) {
      this._type = t._name;
    } else if (isInstanceOf(t, SynthTone)) {
      this._type = t._name;
    } else if (isInstanceOf(t, WaveTone)) {
      this._type = t._name;
    } else if (isInstanceOf(t, String)) {
      this.type(t);
    }
  }

  type(t) {
    if (isInstanceOf(t, String)) {
      this._type = t;
    } else {
      throw new TypeError("Tone type should be a String.");
    }

    return this;
  }

  continued(c) {
    if (isInstanceOf(c, Boolean)) {
      this._continued = c;
    } else {
      throw new TypeError("Tone 'continued' should be Boolean.");
    }

    return this;
  }

  addFilter(t) {
    if (isInstanceOf(t, String)) {
      this._filter.push(t);
    } else if (isArrayOf(t, String)) {
      this._filter.push(...t);
    } else {
      throw new TypeError("Tone filter should be a String or String Array.");
    }

    return this;
  }

  get() {
    return {
      type: this._type,
      continued: this._continued,
      filter: [...this._filter]
    };
  }

  clone() {
    let _c = new Tone(this._type, this._continued);
    _c.addFilter(this._filter);
    return _c;
  }
}