import { deepcopy, isInstanceOf } from "./erie-util";

export class Density {
  constructor(field) {
    this._density;
    this._groupby = [];
    this._cumulative = false;
    this._counts = false;
    this._bandwidth;
    this._extent;
    this._minsteps = 25;
    this._maxsteps = 200;
    this._steps;
    this._as = ['value', 'density'];
    if (field) this.field(field);
  }

  field(f) {
    if (isInstanceOf(f, String)) {
      this._density = f;
    } else {
      throw new TypeError("Density 'field' (density) value should be a String.");
    }

    return this;
  }

  extent(a) {
    if (isInstanceOf(a, Array) &&
      a.length == 2 &&
      a.every((d) => isInstanceOf(d, Number))) {
      this._extent = [...a];
    } else {
      throw new TypeError("Density 'extent' should be an Array of two Numbers.");
    }

    return this;
  }
  groupby(g) {
    if (isInstanceOf(g, Array) && g.every((d) => isInstanceOf(d, String))) {
      this._groupby = [...g];
    } else {
      throw new TypeError("Density 'groupby' should be an Array of Strings.");
    }
    return this;
  }

  cumulative(v) {
    if (isInstanceOf(v, Boolean)) {
      this._cumulative = v;
    } else {
      throw new TypeError("Density 'cumulative' must be Boolean.");
    }
    return this;
  }

  counts(v) {
    if (isInstanceOf(v, Boolean)) {
      this._counts = v;
    } else {
      throw new TypeError("Density 'counts' must be Boolean.");
    }

    return this;
  }

  bandwidth(v) {
    if (isInstanceOf(v, Number)) {
      this._bandwidth = v;
    } else {
      throw new TypeError("Density 'bandwidth' should be a Number.");
    }

    return this;
  }

  minsteps(v) {
    if (isInstanceOf(v, Number)) {
      this._minsteps = v;
    } else {
      throw new TypeError("Density 'minsteps' should be a Number.");
    }

    return this;
  }

  maxsteps(v) {
    if (isInstanceOf(v, Number)) {
      this._maxsteps = v;
    } else {
      throw new TypeError("Density 'maxsteps' should be a Number.");
    }

    return this;
  }

  steps(v) {
    if (isInstanceOf(v, Number)) {
      this._steps = v;
    } else {
      throw new TypeError("Density 'steps' should be a Number.");
    }

    return this;
  }

  as(a) {
    if (isInstanceOf(a, Array) &&
      a.length == 2 &&
      a.every((d) => isInstanceOf(d, String))) {
      this._as = [...a];
    } else {
      throw new TypeError("Density 'as' should be an Array of two Strings.");
    }

    return this;
  }

  get() {
    return {
      density: this._density,
      extent: [...this._extent],
      groupby: [...this._groupby],
      cumulative: this._cumulative,
      counts: this._counts,
      bandwidth: this._bandwidth,
      minsteps: this._minsteps,
      maxsteps: this._maxsteps,
      steps: this._steps,
      as: [...this._as]
    };
  }

  clone() {
    let _c = new Density(this._density);
    _c._density = this._density;
    _c._extent = [...this._extent];
    if (this._groupby) _c._groupby = [...this._groupby];
    _c._cumulative = this._cumulative;
    _c._counts = this._counts;
    _c._bandwidth = this._bandwidth;
    _c._minsteps = this._minsteps;
    _c._maxsteps = this._maxsteps;
    _c._steps = this._steps;
    if (this._as) _c._as = [...this._as];
    return _c;
  }
}