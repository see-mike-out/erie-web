import { Config } from "./erie-config";
import { Synth } from "./erie-synth";
import {
  Data,
  Datasets
} from "./erie-data";
import { Sampling } from "./erie-sampling";
import { Stream } from "./erie-stream";
import { TickList } from "./erie-tick";
import { Transform } from "./erie-transform";
import {
  isArrayOf,
  isInstanceOf
} from "./erie-util";
import { Wave } from "./erie-wave";
import { OverlayObject } from "../types/api/stream";
import {
  DataObject,
  DatasetObject
} from "../types/api/data";
import { DataSpec, OverlayStreamSpec, OverlayStreamSpec1, OverlayStreamSpec2 } from "types";
import { dropUndefined } from "../util";
import { Notify } from "./erie-notify";
import { deepcopy } from "../util";

export class Overlay {
  _name?: string;
  _title?: string;
  _description?: string;
  _skipTitle?: boolean;
  _skipDescription?: boolean;
  _skipLength?: boolean;

  overlay: Stream[];
  datasets?: Datasets;
  transform?: Transform;
  data?: Data;
  sampling?: Sampling;
  synth?: Synth;
  wave?: Wave;
  tick?: TickList;
  config?: Config;
  notify?: { [key: string]: Notify };

  constructor(...a: any) {
    this.datasets = new Datasets();
    this.transform = new Transform();
    this.data = new Data();
    this.sampling = new Sampling();
    this.synth = new Synth();
    this.wave = new Wave();
    this.tick = new TickList();
    this.config = new Config();

    let args = [...a];
    if (isInstanceOf(args[0], String)) {
      this._name = args[0];
      args.splice(0, 1);
    }
    this.overlay = [];
    if (isArrayOf(args[0], Stream)) {
      this.addStreams(args[0])
    } else if (isArrayOf(args, Stream)) {
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

  skipTitle(b: boolean) {
    this._skipTitle = b;
    return this;
  }

  description(n: string) {
    this._description = n;
    return this;
  }

  skipDescription(b: boolean) {
    this._skipDescription = b;
    return this;
  }

  skipLength(b: boolean) {
    this._skipDescription = b;
    return this;
  }

  stream(i: number) {
    return this.overlay[i];
  }

  remove(i: number) {
    this.overlay.splice(i, 1);
    return this;
  }

  add(s: Stream) {
    if (isInstanceOf(s, Stream)) {
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
      this.overlay.push(clone);
    } else {
      throw new TypeError("Wrong item to add into a sequence.")
    }

    return this;
  }

  addStreams(ss: Stream[]) {
    for (const s of ss) {
      this.add(s);
    }

    return this;
  }

  get(): OverlayObject {
    let g: OverlayObject = {
      name: this._name,
      title: this._title,
      description: this._description,
      skipTitle: this._skipTitle,
      skipDescription: this._skipDescription,
      skipLength: this._skipLength,
      data: <DataObject>this.data?.get(),
      datasets: <DatasetObject[]>this.datasets?.get(),
      transform: this.transform?.get(),
      tick: this.tick?.get(),
      synth: this.synth?.get(),
      sampling: this.sampling?.get(),
      wave: this.wave?.get(),
      overlay: this.overlay.map((d) => d.get()),
      config: this.config?.get(),
      notify: Object.keys(this.notify ?? {}).reduce((acc, curr) => {
        if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
        return acc;
      }, {} as { [key: string]: Notify })
    };

    return g;
  }

  toSpec(): OverlayStreamSpec {
    if (this.datasets?.toSpec()) {
      const o: OverlayStreamSpec2 = {
        name: this._name,
        title: this._title,
        description: this._description,
        skipTitle: this._skipTitle,
        skipDescription: this._skipDescription,
        skipLength: this._skipLength,
        datasets: this.datasets.toSpec(),
        transform: this.transform?.get(),
        tick: this.tick?.get(),
        synth: this.synth?.get(),
        sampling: this.sampling?.get(),
        wave: this.wave?.get(),
        overlay: this.overlay.map((d) => d.toSpec()),
        config: this.config?.get(),
        notify: Object.keys(this.notify ?? {}).reduce((acc, curr) => {
          if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
          return acc;
        }, {} as { [key: string]: Notify })
      };
      return dropUndefined(o);
    } else {
      const o: OverlayStreamSpec1 = {
        name: this._name,
        title: this._title,
        description: this._description,
        skipTitle: this._skipTitle,
        skipDescription: this._skipDescription,
        skipLength: this._skipLength,
        data: this.data?.toSpec() as DataSpec,
        transform: this.transform?.get(),
        tick: this.tick?.get(),
        synth: this.synth?.get(),
        sampling: this.sampling?.get(),
        wave: this.wave?.get(),
        overlay: this.overlay.map((d) => d.toSpec()),
        config: this.config?.get(),
        notify: Object.keys(this.notify ?? {}).reduce((acc, curr) => {
          if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
          return acc;
        }, {} as { [key: string]: Notify })
      };
      return dropUndefined(o);
    }
  }

  clone() {
    let _c = new Overlay();
    _c._name = this._name;
    _c._title = this._title;
    _c._description = this._description;
    _c._skipTitle = this._skipTitle;
    _c._skipDescription = this._skipDescription;
    _c._skipLength = this._skipLength;
    _c.data = this.data?.clone();
    _c.datasets = this.datasets?.clone();
    _c.transform = this.transform?.clone();
    _c.synth = this.synth?.clone();
    _c.sampling = this.sampling?.clone();
    _c.wave = this.wave?.clone();
    _c.overlay = this.overlay.map((d) => d.clone());
    _c.config = this.config?.clone();
    _c.tick = this.tick?.clone();
    _c.notify = Object.keys(this.notify ?? {}).reduce((acc, curr) => {
      if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
      return acc;
    }, {} as { [key: string]: Notify });

    return _c;
  }
}