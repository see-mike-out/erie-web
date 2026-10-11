import { Config } from "./erie-config";
import { Synth } from "./erie-synth";
import {
  Data,
  Datasets
} from "./erie-data";
import { Sampling } from "./erie-sampling";
import { Tone } from "./erie-tone";
import { Transform } from "./erie-transform";
import { Wave } from "./erie-wave";
import {
  TimeChannel,
  Time2Channel,
  DurationChannel,
  TapSpeedChannel,
  TapCountChannel,
  PitchChannel,
  LoudnessChannel,
  PanChannel,
  PostReverbChannel,
  SpeechBeforeChannel,
  SpeechAfterChannel,
  RepeatChannel,
  ModulationChannel,
  TimbreChannel,
  HarmonicityChannel,
  DetuneChannel
} from "./erie-channels";
import {
  TIME_chn,
  TIME2_chn,
  DUR_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  POST_REVERB_chn,
  PITCH_chn,
  LOUDNESS_chn,
  PAN_chn,
  SPEECH_BEFORE_chn,
  SPEECH_AFTER_chn,
  TIMBRE_chn,
  REPEAT_chn,
  MODULATION_chn,
  HARMONICITY_chn,
  DETUNE_chn,
  SingleStreamSpec,
  UnitStreamSpec,
  DataSpec,
  StreamingDataSpec
} from "../types";
import { TickList } from "./erie-tick";
import { Channel } from "./erie-channel";
import { StreamObject } from "../types/api/stream";
import { DatasetObject } from "../types/api/data";
import { intNotify, Notify } from "./erie-notify";
import { Playback } from "./erie-playback";
import { deepcopy, dropUndefined } from "../util";

export class Stream {
  _name?: string;
  _title?: string;
  _description?: string;
  _skipTitle?: boolean;
  _skipDescription?: boolean;
  data: Data;
  datasets?: Datasets;
  transform?: Transform;
  synth?: Synth;
  sampling?: Sampling;
  wave?: Wave;
  tone: Tone;
  tick?: TickList;
  encoding: { [key: string]: Channel };
  config?: Config;
  notify?: { [key: string]: Notify };
  playback?: Playback;

  constructor() {
    this.data = new Data();
    this.datasets = new Datasets();
    this.transform = new Transform();
    this.synth = new Synth();
    this.sampling = new Sampling();
    this.wave = new Wave();
    this.tone = new Tone();
    this.tick = new TickList();
    this.encoding = {
      [TIME_chn]: new TimeChannel(),
      [TIME2_chn]: new Time2Channel(),
      [DUR_chn]: new DurationChannel(),
      [TAPCNT_chn]: new TapCountChannel(),
      [TAPSPD_chn]: new TapSpeedChannel(),
      [POST_REVERB_chn]: new PostReverbChannel(),
      [PITCH_chn]: new PitchChannel(),
      [DETUNE_chn]: new DetuneChannel(),
      [LOUDNESS_chn]: new LoudnessChannel(),
      [PAN_chn]: new PanChannel(),
      [SPEECH_BEFORE_chn]: new SpeechBeforeChannel(),
      [SPEECH_AFTER_chn]: new SpeechAfterChannel(),
      [TIMBRE_chn]: new TimbreChannel(),
      [REPEAT_chn]: new RepeatChannel(),
      [MODULATION_chn]: new ModulationChannel(),
      [HARMONICITY_chn]: new HarmonicityChannel()
    };
    this.config = new Config();
    this.notify = intNotify();
    this.playback = new Playback();
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

  private isStreaming() {
    return this.data.type === 'streaming';
  }

  get(): StreamObject {
    let g: StreamObject = {
      name: this._name,
      title: this._title,
      description: this._description,
      data: this.data?.get(),
      datasets: <DatasetObject[]>this.datasets?.get(),
      transform: this.transform?.get(),
      tick: this.tick?.get(),
      synth: this.synth?.get(),
      sampling: this.sampling?.get(),
      wave: this.wave?.get(),
      tone: this.tone?.get(),
      encoding: {},
      config: this.config?.get(),
      notify: Object.keys(this.notify ?? {}).reduce((acc, curr) => {
        if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
        return acc;
      }, {} as { [key: string]: Notify })
    }
    Object.keys(this.encoding).forEach((chn) => {
      if (this.encoding[chn].defined) {
        g.encoding[chn] = this.encoding[chn].get();
      }
    });

    return g;
  }

  toSpec(): SingleStreamSpec | UnitStreamSpec {
    const data = this.data.toSpec();
    if (data === undefined) throw new Error("Stream data is not set.");
    const o: any = {
      title: this._title,
      description: this._description,
      name: this._name,
      skipTitle: this._skipTitle,
      skipDescription: this._skipDescription,
      data: data as DataSpec | StreamingDataSpec,
      datasets: this.datasets?.toSpec(),
      transform: this.transform?.get(),
      tone: this.tone.get(),
      tick: this.tick?.get(),
      synth: this.synth?.get(),
      sampling: this.sampling?.get(),
      wave: this.wave?.get(),
      config: this.config?.get()
    };
    o.encoding = {};
    Object.keys(this.encoding).forEach((chn) => {
      if (this.encoding[chn].defined) {
        o.encoding[chn] = this.encoding[chn].clone();
      }
    });
    if (this.isStreaming()) {
      o.playback = this.playback?.get();
    }
    o.notify = {};
    if (this.notify) {
      Object.keys(this.notify).forEach((key) => {
        if (this.notify?.[key]) {
          o.notify[key] = this.notify[key].clone();
        }
      });
    }
    return dropUndefined(o);
  }

  clone(): Stream {
    let _c = new Stream();
    _c._name = this._name;
    _c._title = this._title;
    _c._description = this._description;
    _c.data = this.data.clone();
    _c.datasets = this.datasets?.clone();
    _c.transform = this.transform?.clone();
    _c.synth = this.synth?.clone();
    _c.sampling = this.sampling?.clone();
    _c.wave = this.wave?.clone();
    _c.tone = this.tone.clone();
    _c.playback = this.playback?.clone();
    _c.notify = Object.keys(this.notify ?? {}).reduce((acc, curr) => {
      if (this.notify?.[curr]) acc[curr] = deepcopy(this.notify?.[curr]);
      return acc;
    }, {} as { [key: string]: Notify });
    _c.encoding = {};
    Object.keys(this.encoding).forEach((chn) => {
      _c.encoding[chn] = this.encoding[chn].clone();
    });
    _c.config = this.config?.clone();
    _c.tick = this.tick?.clone();

    return _c;
  }
}