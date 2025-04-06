import {
  WaveItem,
  WaveObject
} from "../types";


export class WaveTone {
  _name: string
  _disableNormalization: boolean;
  _real: number[];
  _imag: number[];

  constructor(name: string, defs?: WaveItem) {
    this._name = name;
    if (!name) {
      throw new Error('A sampled tone must have a name.')
    }
    this._disableNormalization = false;
    this._real = [];
    this._imag = [];
    if (defs) {
      this.wave(defs);
    }
  }

  setName(n: string) {
    this._name = n;
    return this;
  }

  real(r: number[]) {
    this._real = r;

    return this;
  }

  imag(a: number[]) {
    this._imag = a;
    return this;
  }

  wave(w: WaveItem) {
    if (w.real && w.imag) {
      this.real(w.real);
      this.imag(w.imag);
    } else {
      throw new TypeError('The definition a periodic wave must consist of "real" (sine terms) and "imag" (cosine terms) properties.');
    }

    return this;
  }

  disableNormalization(v: boolean) {
    this._disableNormalization = v;
    return this;
  }

  get(): WaveObject {
    return {
      name: this._name,
      real: [...this._real],
      imag: [...this._imag],
      disableNormalization: this._disableNormalization
    }
  }

  clone(): WaveTone {
    let _c = new WaveTone(this._name);
    _c._real = [...this._real];
    _c._imag = [...this._imag];
    _c._disableNormalization = this._disableNormalization;
    return _c;
  }
}

export class Wave {
  wave: WaveTone[];

  constructor() {
    this.wave = [];
  }

  add(a: WaveTone) {
    this.wave.push(a);
    return this;
  }

  get(): WaveObject[] {
    return this.wave.map((d) => d.get());
  }

  clone(): Wave {
    let _c = new Wave();
    _c.wave = this.wave.map((d) => d.clone());
    return _c
  }
}