import { Stream } from "./erie-stream";
import { Overlay } from "./erie-overlay";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";
import { Config } from "./erie-config";
import { Synth } from "./erie-synth";
import {
  Data,
  Datasets
} from "./erie-data";
import { Sampling } from "./erie-sampling";
import { TickList } from "./erie-tick";
import { Transform } from "./erie-transform";
import { Wave } from "./erie-wave";
import { SequenceObject } from "../types/api/stream";
import {
  DataObject,
  DatasetObject
} from "../types/api/data";


export class Sequence {
  _name?: string;
  _title?: string;
  _description?: string;
  sequence: Array<Stream | Overlay>;
  datasets?: Datasets;
  transform?: Transform;
  data?: Data;
  sampling?: Sampling;
  synth?: Synth;
  wave?: Wave;
  tick?: TickList;
  config?: Config;

  constructor(...a: any) {
    let args = [...a];
    if (isInstanceOf(args[0], String)) {
      this._name = args[0];
      args.splice(0, 1);
    }
    this.datasets = new Datasets();
    this.transform = new Transform();
    this.data = new Data();
    this.sampling = new Sampling();
    this.synth = new Synth();
    this.wave = new Wave();
    this.tick = new TickList();
    this.config = new Config();

    this.sequence = [];
    if (isArrayOf(args[0], [Stream, Overlay])) {
      this.addStreams(args[0])
    } else if (isArrayOf(args, [Stream, Overlay])) {
      this.addStreams(args)
    }
  }

  name(n: string) {
    this._name = n;
    return this;
  }

  title(n: string) {
    this._title = n;
    return this;
  }

  description(n: string) {
    this._description = n;
    return this;
  }

  stream(i: number) {
    return this.sequence[i];
  }

  remove(i: number) {
    this.sequence.splice(i, 1);
    return this;
  }

  add(s: Stream | Overlay) {
    if (isInstanceOf(s, Stream) || isInstanceOf(s, Overlay)) {
      let clone = s.clone();
      // datasets
      let cloned_datasets = clone.datasets;
      if (cloned_datasets && cloned_datasets.datasets.length > 0) {
        for (const ds of cloned_datasets.datasets) {
          this.datasets?.add(ds);
        }
      }
      delete clone.datasets;

      // tick
      let cloned_ticks = clone.tick;
      if (cloned_ticks && cloned_ticks.tick.length > 0) {
        for (const ds of cloned_ticks.tick) {
          this.tick?.add(ds);
        }
      }
      delete clone.tick;

      // sampling
      let cloned_samples = clone.sampling;
      if (cloned_samples && cloned_samples.sampling.length > 0) {
        for (const ds of cloned_samples.sampling) {
          this.sampling?.add(ds);
        }
      }
      delete clone.sampling;

      // synth
      let cloned_synths = clone.synth;
      if (cloned_synths && cloned_synths.synth.length > 0) {
        for (const ds of cloned_synths.synth) {
          this.synth?.add(ds);
        }
      }
      delete clone.synth;

      // wave
      let cloned_waves = clone.wave;
      if (cloned_waves && cloned_waves.wave.length > 0) {
        for (const ds of cloned_waves.wave) {
          this.wave?.add(ds);
        }
      }
      delete clone.wave;
      this.sequence.push(clone);
    }

    return this;
  }

  addStreams(ss: Array<Overlay | Stream>) {
    for (const s of ss) {
      this.add(s);
    }

    return this;
  }


  get(): SequenceObject {
    let g: SequenceObject = {
      name: this._name,
      title: this._title,
      description: this._description,
      data: <DataObject>this.data?.get(),
      datasets: <DatasetObject[]>this.datasets?.get(),
      transform: this.transform?.get(),
      tick: this.tick?.get(),
      synth: this.synth?.get(),
      sampling: this.sampling?.get(),
      wave: this.wave?.get(),
      sequence: this.sequence.map((d) => d.get()),
      config: this.config?.get()
    };

    return g;
  }

  clone() {
    let _c = new Sequence();
    _c._name = this._name;
    _c._title = this._title;
    _c._description = this._description;
    _c.data = this.data?.clone();
    _c.datasets = this.datasets?.clone();
    _c.transform = this.transform?.clone();
    _c.synth = this.synth?.clone();
    _c.sampling = this.sampling?.clone();
    _c.wave = this.wave?.clone();
    _c.sequence = this.sequence.map((d) => d.clone());
    _c.config = this.config?.clone();
  }
}