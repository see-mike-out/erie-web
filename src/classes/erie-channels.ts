import { Channel } from "./erie-channel";
import { isInstanceOf } from "./erie-util";
import {
  DUR_chn,
  LOUDNESS_chn,
  PAN_chn,
  PITCH_chn,
  POST_REVERB_chn,
  REPEAT_chn,
  SPEECH_AFTER_chn,
  SPEECH_BEFORE_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  TIME2_chn,
  TIME_chn,
  MODULATION_chn,
  HARMONICITY_chn,
  TIMBRE_chn,
  DETUNE_chn,
  ChannelObject,
  EncodingType
} from "../types";


export class TimeChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = TIME_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }

  clone(): TimeChannel {
    let _c = new TimeChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class Time2Channel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = TIME2_chn;
  }

  clone(): Time2Channel {
    let _c = new Time2Channel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class DurationChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = DUR_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }

  clone(): DurationChannel {
    let _c = new DurationChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

const MAX_LIMIT_TAP_SPEED = 7;
export class TapSpeedChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = TAPSPD_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_TAP_SPEED;
  }

  clone(): TapSpeedChannel {
    let _c = new TapSpeedChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class TapCountChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = TAPCNT_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }

  clone(): TapCountChannel {
    let _c = new TapCountChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

const MAX_LIMIT_PITCH = 3000;
export class PitchChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = PITCH_chn;
    this._roundToNote = false;
  }

  roundToNote(v: boolean) {
    this._roundToNote = v;
    return this;
  }

  validator(v: any) {
    return (isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_PITCH) || (isInstanceOf(v, String) && v.match(/^[A-F][0-9]$/gi));
  }

  clone(): PitchChannel {
    let _c = new PitchChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class DetuneChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = DETUNE_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= -1200 && v <= 1200;
  }

  clone(): DetuneChannel {
    let _c = new DetuneChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class LoudnessChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = LOUDNESS_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number);
  }

  clone(): LoudnessChannel {
    let _c = new LoudnessChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class PanChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = PAN_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= -1 && v <= 1;
  }

  clone(): PanChannel {
    let _c = new PanChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class PostReverbChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = POST_REVERB_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }

  clone(): PostReverbChannel {
    let _c = new PostReverbChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class SpeechBeforeChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = SPEECH_BEFORE_chn;
  }

  clone(): SpeechBeforeChannel {
    let _c = new SpeechBeforeChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class SpeechAfterChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = SPEECH_AFTER_chn;
  }

  clone(): SpeechAfterChannel {
    let _c = new SpeechAfterChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class RepeatChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = REPEAT_chn;
  }

  clone(): RepeatChannel {
    let _c = new RepeatChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class ModulationChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = MODULATION_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v > 0;
  }

  clone(): ModulationChannel {
    let _c = new ModulationChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class HarmonicityChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = HARMONICITY_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v > 0
  }

  clone(): HarmonicityChannel {
    let _c = new HarmonicityChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}

export class TimbreChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t);
    this._channel = TIMBRE_chn;
  }

  validator(v: any) {
    return isInstanceOf(v, String);
  }

  clone(): TimbreChannel {
    let _c = new TimbreChannel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}