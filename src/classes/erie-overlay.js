import { Config } from "./erie-config";
import { Synth } from "./erie-synth";
import { Data } from "./erie-data";
import { Datasets } from "./erie-datasets";
import { Sampling } from "./erie-sampling";
import { Stream } from "./erie-stream";
import { TickList } from "./erie-tick";
import { Transform } from "./erie-transform";
import { isArrayOf, isInstanceOf } from "./erie-util";
import { Wave } from "./erie-wave";

export class Overlay {
  constructor(...a) {
    let args = [...a];
    if (isInstanceOf(args[0], String)) {
      this.name(args[0]);
      args.splice(0, 1);
    }
    this.overlay = [];
    if (isArrayOf(args[0], Stream)) {
      this.addStreams(args[0])
    } else if (isArrayOf(args, Stream)) {
      this.addStreams(args)
    }
    this.datasets = new Datasets();
    this.transform = new Transform();
    this.data = new Data();
    this.sampling = new Sampling();
    this.synth = new Synth();
    this.wave = new Wave();
    this.tick = new TickList();
    this.config = new Config();
  }

  name(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError("An overlay name must be a String.");
    }

    return this;
  }

  title(n) {
    if (isInstanceOf(n, String)) {
      this._title = n;
    } else {
      throw new TypeError("An overlay title must be a String.");
    }

    return this;
  }

  description(n) {
    if (isInstanceOf(n, String)) {
      this._description = n;
    } else {
      throw new TypeError("An overlay description must be a String.");
    }

    return this;
  }

  stream(i) {
    return this.overlay[i];
  }

  remove(i) {
    this.overlay.splice(i, 1);

    return this;
  }

  add(s) {
    if (isInstanceOf(s, Stream)) {
      let clone = s.clone();
      // datasets
      let cloned_datasets = clone.datasets;
      if (cloned_datasets && cloned_datasets.length > 0) {
        for (const ds of cloned_datasets) {
          this.datasets.add(ds);
        }
      }
      clone.datasets = null;
      // tick
      let cloned_ticks = clone.tick;
      if (cloned_ticks && cloned_ticks.length > 0) {
        for (const ds of cloned_ticks) {
          this.tick.add(ds);
        }
      }
      clone.tick = null;
      // sampling
      let cloned_samples = clone.sampling;
      if (cloned_samples && cloned_samples.length > 0) {
        for (const ds of cloned_samples) {
          this.sampling.add(ds);
        }
      }
      clone.sampling = null;
      // synth
      let cloned_synths = clone.synth;
      if (cloned_synths && cloned_synths.length > 0) {
        for (const ds of cloned_synths) {
          this.synth.add(ds);
        }
      }
      clone.synth = null;
      // wave
      let cloned_waves = clone.wave;
      if (cloned_waves && cloned_waves.length > 0) {
        for (const ds of cloned_waves) {
          this.wave.add(ds);
        }
      }
      clone.wave = null;
      this.overlay.push(clone);
    }

    return this;
  }

  addStreams(ss) {
    for (const s of ss) {
      this.add(s);
    }

    return this;
  }

  get() {
    let g = {
      name: this._name,
      title: this._title,
      description: this._description,
      data: this.data.get(),
      datasets: this.datasets.get(),
      transform: this.transform.get(),
      tick: this.tick.get(),
      synth: this.synth.get(),
      sampling: this.sampling.get(),
      wave: this.wave.get(),
      overlay: this.overlay.map((d) => d.get()),
      config: this.config.get()
    };

    return g;
  }

  clone() {
    let _c = new Sequence();
    _c._name = this._name;
    _c._title = this._title;
    _c._description = this._description;
    _c.data = this.data.clone();
    _c.datasets = this.datasets.clone();
    _c.transform = this.transform.clone();
    _c.synth = this.synth.clone();
    _c.sampling = this.sampling.clone();
    _c.wave = this.wave.clone();
    _c.overlay = this.overlay.map((d) => d.clone());
    _c.config = this.config.clone();
  }
}