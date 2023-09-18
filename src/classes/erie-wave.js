import { isArrayOf, isInstanceOf } from "./erie-util";


export class WaveTone {
  constructor(name, defs) {
    this._name;
    if (!name) {
      throw new Error('A sampled tone must have a name.')
    }
    this.setName(name);
    this._disableNormalization = false;
    this._real = [];
    this._imag = [];
    if (defs) {
      this.wave(defs);
    }
  }

  setName(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError('The name of a synth tone must be String.');
    }

    return this;
  }

  real(r) {
    if (isArrayOf(r, Number)) {
      this._real = r;
    } else {
      throw new TypeError('The "real" property (sine terms) of a periodic wave must be an Array of Numbers.');
    }

    return this;
  }

  imag(a) {
    if (isArrayOf(a, Number)) {
      this._imag = a;
    } else {
      throw new TypeError('The "imag" property (cosine terms) of a periodic wave must be an Array of Numbers.');
    }

    return this;
  }

  wave(w) {
    if (isInstanceOf(w, Object) && w.real && w.imag) {
      this.real(w.real);
      this.imag(w.imag);
    } else {
      throw new TypeError('The definition a periodic wave must consist of "real" (sine terms) and "imag" (cosine terms) properties.');
    }

    return this;
  }

  disableNormalization(v) {
    if (isInstanceOf(v, Boolean)) {
      this._disableNormalization = v;
    } else {
      throw new TypeError(`The 'disableNormalization' value should be a Boolean.`);
    }

    return this;
  }

  get() {
    return {
      name: this._name,
      real: [...this._real],
      imag: [...this._imag],
      disableNormalization: this._disableNormalization
    }
  }

  clone() {
    let _c = new SynthTone(this._name);
    _c._real = [...this._real];
    _c._imag = [...this._imag];
    _c._disableNormalization = this._disableNormalization;
    return _c;
  }
}

export class Wave {
  constructor() {
    this.wave = [];
  }

  add(a) {
    if (isInstanceOf(a, WaveTone)) {
      this.wave.push(a);
    } else {
      throw new TypeError('A wave tone must be created using WaveTone class.');
    }

    return this;
  }

  get() {
    return this.wave.map((d) => d.get());
  }

  clone() {
    let _c = new Wave();
    _c.wave = this.wave.map((d) => d.clone());
    return _c
  }
}