import { SynthTone } from "./erie-synth";
import { SampledTone } from "./erie-sampling";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";
import { WaveTone } from "./erie-wave";
import { ToneObject } from "../types/tone";


export class Tone {
  _type: string;
  _continued: boolean;
  _filter: any[];

  constructor(type?: string, c?: boolean) {
    this._type = 'default';
    if (type) this.set(type);
    this._continued = false;
    if (c !== undefined) this.continued(c);

    this._filter = [];
  }

  set(t: SampledTone | SynthTone | WaveTone | string) {
    if (typeof t === 'string') {
      this.type(t);
    } else {
      this._type = t._name;
    }
  }

  type(t: string) {
    this._type = t;
    return this;
  }

  continued(c: boolean) {
    this._continued = c;
    return this;
  }

  addFilter(t: string | string[]) {
    if (isInstanceOf(t, String)) {
      this._filter.push(t);
    } else if (isArrayOf(t, String)) {
      this._filter.push(...t);
    }
    return this;
  }

  get(): ToneObject {
    return {
      type: this._type,
      continued: this._continued,
      filter: [...this._filter]
    };
  }

  clone(): Tone {
    let _c = new Tone(this._type, this._continued);
    _c.addFilter(this._filter);
    return _c;
  }
}