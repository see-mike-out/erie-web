import { Config } from "./erie-config";
import { Synth } from "./erie-synth";
import { Data } from "./erie-data";
import { Datasets } from "./erie-datasets";
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
  DETUNE_chn
} from "./erie-channel-constants";
import { TickList } from "./erie-tick";
import { isInstanceOf } from "./erie-util";

export class Stream {
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
  }

  name(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError("An stream name must be a String.");
    }

    return this;
  }

  title(n) {
    if (isInstanceOf(n, String)) {
      this._title = n;
    } else {
      throw new TypeError("An stream title must be a String.");
    }

    return this;
  }

  description(n) {
    if (isInstanceOf(n, String)) {
      this._description = n;
    } else {
      throw new TypeError("An stream description must be a String.");
    }

    return this;
  }

  get() {
    let g = {
      name: this._name,
      title: this._title,
      description: this._description,
      data: this.data?.get(),
      datasets: this.datasets?.get(),
      transform: this.transform.get(),
      tick: this.tick?.get(),
      synth: this.synth?.get(),
      sampling: this.sampling?.get(),
      wave: this.wave?.get(),
      tone: this.tone?.get(),
      encoding: {},
      config: this.config?.get()
    }
    Object.keys(this.encoding).forEach((chn) => {
      if (this.encoding[chn].defined) {
        g.encoding[chn] = this.encoding[chn].get();
      }
    });

    return g;
  }

  clone() {
    let _c = new Stream();
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
    _c.encoding = {};
    Object.keys(this.encoding).forEach((chn) => {
      if (this.encoding[chn].defined) {
        _c.encoding[chn] = this.encoding[chn].clone();
      }
    });
    _c.config = this.config.clone();

    return _c;
  }
}