import { SynthTone } from "./erie-synth";
import { SampledTone } from "./erie-sampling";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";
import { WaveTone } from "./erie-wave";
import { ToneObject } from "../types";


export class Tone {
  _type: string;
  _continued: boolean;
  _filter: any[];
  _hasBaseTone?: boolean;
  _sustain?: boolean;
  _baseToneAsTick?: boolean | string;
  _tickInterval?: number;

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
    return this;
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
    } else {
      throw new TypeError("Filter name must be a string.")
    }
    return this;
  }

  hasBaseTone(h: boolean) {
    this._hasBaseTone = h;
    return this;
  }

  sustain(h: boolean) {
    this._sustain = h;
    return this;
  }

  baseToneAsTick(h: boolean | string) {
    this._baseToneAsTick = h;
    return this;
  }

  tickInterval(i: number) {
    this._tickInterval = i;
    return this;
  }

  get(): ToneObject {
    return {
      type: this._type,
      continued: this._continued,
      filter: [...this._filter],
      hasBaseTone: this._hasBaseTone,
      sustain: this._sustain,
      baseToneAsTick: this._baseToneAsTick,
      tickInterval: this._tickInterval
    };
  }

  clone(): Tone {
    let _c = new Tone(this._type, this._continued);
    _c.addFilter(this._filter);
    if (this._hasBaseTone !== undefined) _c.hasBaseTone(this._hasBaseTone);
    if (this._sustain !== undefined) _c.sustain(this._sustain);
    if (this._baseToneAsTick !== undefined) _c.baseToneAsTick(this._baseToneAsTick);
    if (this._tickInterval !== undefined) _c.tickInterval(this._tickInterval);
    return _c;
  }
}