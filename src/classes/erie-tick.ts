import { dropUndefined } from "../util";
import {
  OscType,
  OscTypes,
  TickObject
} from "../types";

export class Tick {
  _name: string;
  _interval: number;
  _playAtTime0: boolean;
  _oscType?: OscType;
  _pitch?: number;
  _loudness: number;
  _band?: number;
  _description?: string;
  _sample?: string;
  _instrument?: string;

  constructor(name: string) {
    if (name) this._name = name;
    else {
      throw new Error('A tick definition must have a name.')
    }
    this._interval = 0.5;
    this._playAtTime0 = true;
    this._oscType = 'sine';
    this._pitch = 150;
    this._loudness = 0.4;
  }

  setName(n: string) {
    this._name = n;
    return this;
  }

  interval(t: number) {
    if (t > 0) {
      this._interval = t;
    } else {
      throw new TypeError('A tick interval must be greater than 0.');
    }

    return this;
  }

  playAtTime0(t: boolean) {
    this._playAtTime0 = t;
    return this;
  }

  oscType(t: OscType) {
    if (OscTypes.includes(t)) {
      this._oscType = t;
    } else {
      throw new TypeError("Unsupported oscillaotr type.")
    }
    return this;
  }

  pitch(t: number) {
    if (t >= 0) {
      this._pitch = t;
    } else {
      throw new TypeError('A tick pitch must be greater than 0.');
    }
    return this;
  }

  loudness(t: number) {
    if (t >= 0 && t <= 1) {
      this._loudness = t;
    } else {
      throw new TypeError('A tick loudness must be between 0 and 1.');
    }

    return this;
  }

  band(b: number) {
    if (b > 0) {
      this._band = b;
    } else {
      throw new TypeError('A tick band must be greater than 0.');
    }
    return this;
  }

  description(s: string) {
    this._description = s;
    return this;
  }

  sample(s: string) {
    this._sample = s;

    console.warn("Unset the oscillator type and pitch.")
    this._oscType = undefined;
    this._pitch = undefined;

    return this;
  }

  instrument(s: string) {
    this._instrument = s;

    console.warn("Unset the oscillator type and pitch.")
    this._oscType = undefined;
    this._pitch = undefined;

    return this;
  }

  get(): TickObject {
    return dropUndefined({
      name: this._name,
      description: this._description,

      oscType: this._oscType,
      instrument: this._instrument,
      sample: this._sample,

      band: this._band,
      interval: this._interval,
      playAtTime0: this._playAtTime0,

      pitch: this._pitch,
      loudness: this._loudness
    })
  }

  clone(): Tick {
    let _c = new Tick(this._name);
    if (this._description !== undefined) _c.description(this._description);

    if (this._oscType) _c.oscType(this._oscType);
    if (this._instrument) _c.instrument(this._instrument);
    if (this._sample) _c.sample(this._sample);

    if (this._band !== undefined) _c.band(this._band);
    _c.interval(this._interval);
    _c.playAtTime0(this._playAtTime0);

    if (this._pitch !== undefined) _c.pitch(this._pitch);
    _c.loudness(this._loudness);

    return _c;
  }
}



export class TickList {
  tick: Tick[];
  constructor() {
    this.tick = [];
  }

  add(a: Tick) {
    let i = this.tick.findIndex(d => d._name === a._name);
    if (i >= 0) {
      this.tick[i] = a;
    } else {
      this.tick.push(a);
    }
    return this;
  }

  get(): TickObject[] {
    return this.tick.map((d) => d.get());
  }

  clone(): TickList {
    let _c = new TickList();
    _c.tick = this.tick.map((d) => d.clone());

    return _c;
  }
}