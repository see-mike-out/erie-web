import { DensityObject } from "../types/transform";

export class Density {
  _density: string;
  _groupby?: string[];
  _cumulative: boolean;
  _counts: boolean;
  _bandwidth?: number;
  _extent?: number[];
  _minsteps?: number;
  _maxsteps?: number;
  _steps?: number;
  _as: string[];

  constructor(field: string) {
    this._density = field;
    this._cumulative = false;
    this._counts = false;
    this._bandwidth;
    this._extent;
    this._minsteps = 25;
    this._maxsteps = 200;
    this._steps;
    this._as = ['value', 'density'];
  }

  field(f: string) {
    this._density = f;
    return this;
  }

  extent(a: number[]) {
    if (a.length == 2) {
      this._extent = [...a];
    } else {
      throw new TypeError("Density 'extent' should be an Array of two Numbers.");
    }

    return this;
  }
  groupby(g: string[]) {
    this._groupby = [...g];
    return this;
  }

  cumulative(v: boolean) {
    this._cumulative = v;
    return this;
  }

  counts(v: boolean) {
    this._counts = v;
    return this;
  }

  bandwidth(v: number) {
    this._bandwidth = v;
    return this;
  }

  minsteps(v: number) {
    this._minsteps = v;
    return this;
  }

  maxsteps(v: number) {
    this._maxsteps = v;
    return this;
  }

  steps(v: number) {
    this._steps = v;
    return this;
  }

  as(a: string[]) {
    if (a.length == 2) {
      this._as = [...a];
    } else {
      throw new TypeError("Density 'as' should be an Array of two Strings.");
    }

    return this;
  }

  get(): DensityObject {
    return {
      density: this._density,
      extent: this._extent ? [...this._extent] : undefined,
      groupby: this._groupby ? [...this._groupby] : undefined,
      cumulative: this._cumulative,
      counts: this._counts,
      bandwidth: this._bandwidth,
      minsteps: this._minsteps,
      maxsteps: this._maxsteps,
      steps: this._steps,
      as: [...this._as]
    };
  }

  clone(): Density {
    let _c = new Density(this._density);
    _c._density = this._density;
    _c._extent = this._extent ? [...this._extent] : undefined;
    _c._groupby = this._groupby ? [...this._groupby] : undefined;
    _c._cumulative = this._cumulative;
    _c._counts = this._counts;
    _c._bandwidth = this._bandwidth;
    _c._minsteps = this._minsteps;
    _c._maxsteps = this._maxsteps;
    _c._steps = this._steps;
    _c._as = [...this._as];
    return _c;
  }
}