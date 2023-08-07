import { Stream } from "./erie-stream";
import { Overlay } from "./erie-overlay";
import { isArrayOf, isInstanceOf } from "./erie-util";

export class Sequence {
  constructor(...a) {
    let args = [...a];
    if (isInstanceOf(args[0], String)) {
      this.setName(args[0]);
      args.splice(0, 1);
    }
    if (isArrayOf(args[0], [Stream, Overlay])) {
      this.addStreams(args[0])
    } else if (isArrayOf(args, [Stream, Overlay])) {
      this.addStreams(args)
    } else {
      this.sequence = [];
    }
  }

  name(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError("A stream name must be a String.");
    }

    return this;
  }

  title(n) {
    if (isInstanceOf(n, String)) {
      this._title = n;
    } else {
      throw new TypeError("A stream title must be a String.");
    }

    return this;
  }

  description(n) {
    if (isInstanceOf(n, String)) {
      this._description = n;
    } else {
      throw new TypeError("A stream description must be a String.");
    }

    return this;
  }

  stream(i) {
    return this.sequence[i];
  }

  remove(i) {
    this.sequence.splice(i, 1);

    return this;
  }

  add(s) {
    if (isInstanceOf(s, Stream) || isInstanceOf(s, Overlay)) {
      let clone = s.clone();
      // datasets
      let cloned_datasets = clone.datasets;
      if (cloned_datasets.length > 0) {
        for (const ds of cloned_datasets) {
          this.datasets.add(ds);
        }
      }
      clone.datasets = null;
      // tick
      let cloned_ticks = clone.tick;
      if (cloned_ticks.length > 0) {
        for (const ds of cloned_ticks) {
          this.tick.add(ds);
        }
      }
      clone.tick = null;
      // sampling
      let cloned_samples = clone.sampling;
      if (cloned_samples.length > 0) {
        for (const ds of cloned_samples) {
          this.sampling.add(ds);
        }
      }
      clone.sampling = null;
      // synth
      let cloned_synths = clone.synth;
      if (cloned_synths.length > 0) {
        for (const ds of cloned_synths) {
          this.synth.add(ds);
        }
      }
      clone.synth = null;
      // wave
      let cloned_waves = clone.wave;
      if (cloned_waves.length > 0) {
        for (const ds of cloned_waves) {
          this.wave.add(ds);
        }
      }
      clone.wave = null;
      this.sequence.push(clone);
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
      tone: this.tone.get(),
      sequence: this.sequence.map((d) => d.get()),
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
    _c.tone = this.tone.clone();
    _c.sequence = this.sequence.map((d) => d.clone());
    _c.config = this.config.clone();
  }
}