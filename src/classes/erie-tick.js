import { isInstanceOf } from "./erie-util";
import { OscTypes } from "./erie-synth";

export class Tick {
  constructor(name) {
    if (name) this.setName(name)
    else {
      throw new Error('A tick definition must have a name.')
    }
    this._interval = 0.5;
    this._playAtTime0 = true;
    this._oscType = 'sine';
    this._pitch = 150;
    this._loudness = 0.4;
  }

  setName(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError('The name of a synth tone must be String.');
    }

    return this;
  }

  interval(t) {
    if (isInstanceOf(n, Number) && n > 0) {
      this._interval = t;
    } else {
      throw new TypeError('A tick interval must be a Number and greater than 0.');
    }

    return this;
  }


  playAtTime0(t) {
    if (isInstanceOf(n, Boolean)) {
      this._playAtTime0 = t;
    } else {
      throw new TypeError('A tick "playAtTime0" must be Boolean.');
    }

    return this;
  }

  oscType(t) {
    if (OscTypes.includes(t)) {
      this._oscType = t;
    } else {
      throw new TypeError(`A tick oscillator type must be either one of ${OscTypes.join(', ')}.`);
    }

    return this;
  }

  pitch(t) {
    if (isInstanceOf(n, Number) && n > 0) {
      this._pitch = t;
    } else {
      throw new TypeError('A tick pitch must be a Number and greater than 0.');
    }

    return this;
  }

  loudness(t) {
    if (isInstanceOf(n, Number) && n >= 0 && n <= 1) {
      this._loudness = t;
    } else {
      throw new TypeError('A tick loudness must be a Number and between 0 and 1.');
    }

    return this;
  }

  get() {
    return {
      name: this._name,
      interval: this._interval,
      playAtTime0: this._playAtTime0,
      oscType: this._oscType,
      pitch: this._pitch,
      loudness: this._loudness
    }
  }

  clone() {
    let _c = new Tick(this._name);
    _c.interval(this._interval);
    _c.pitch(this._playAtTime0);
    _c.oscType(this._oscType);
    _c.pitch(this._pitch);
    _c.loudness(this._loudness);
    return _c;
  }
}



export class TickList {
  constructor() {
    this.tick = [];
  }

  add(a) {
    if (isInstanceOf(a, Tick)) {
      this.tick.push(a);
    } else {
      throw new TypeError('A tick definition must be created using Tick class.');
    }

    return this;
  }

  get() {
    return this.tick.map((d) => d.get());
  }

  clone() {
    let _c = new Tick();
    _c.tick = this.tick.map((d) => d.clone());

    return _c;
  }
}