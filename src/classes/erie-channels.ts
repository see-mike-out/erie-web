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
    super(f, t, TIME_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

export class Time2Channel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, TIME2_chn);
  }
}

export class DurationChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, DUR_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

const MAX_LIMIT_TAP_SPEED = 7;
export class TapSpeedChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, TAPSPD_chn);
  }

  validator(v: any) {
    if (v > MAX_LIMIT_TAP_SPEED) {
      console.warn(`The value ${v} for the tapSpeed channel may burden audio contexts (recommendation: <= ${MAX_LIMIT_TAP_SPEED}).`)
    }
    return isInstanceOf(v, Number) && v >= 0;
  }
}

export class TapCountChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, TAPCNT_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

const MAX_LIMIT_PITCH = 3000;
export class PitchChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, PITCH_chn);
    this._roundToNote = false;
  }

  roundToNote(v: boolean) {
    this._roundToNote = v;
    return this;
  }

  validator(v: any) {
    if (v > MAX_LIMIT_PITCH) {
      console.warn(`The value ${v} for the pitch channel may burden audio contexts (recommendation: <= ${MAX_LIMIT_PITCH}).`)
    }
    return (isInstanceOf(v, Number) && v >= 0) || (isInstanceOf(v, String) && v.match(/^[A-G](#|b)?[0-9]$/i) !== null);
  }
}

export class DetuneChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, DETUNE_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= -1200 && v <= 1200;
  }
}

export class LoudnessChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, LOUDNESS_chn);
  }

  validator(v: any) {
    if (v > 1) {
      console.warn(`The loudness value greater than 1 (${v}) may result in too loud sound.`)
    }
    return isInstanceOf(v, Number);
  }
}

export class PanChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, PAN_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= -1 && v <= 1;
  }
}

export class PostReverbChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, POST_REVERB_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

export class SpeechBeforeChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, SPEECH_BEFORE_chn);
  }
}

export class SpeechAfterChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, SPEECH_AFTER_chn);
  }
}

export class RepeatChannel extends Channel {
  constructor(f?: string | string[], t?: EncodingType) {
    super(f, t, REPEAT_chn);
  }

  clone(): Channel {
    let _c = new (this.constructor as any)();
    let _g: ChannelObject = this.get();
    _c.assignFrom(_g);
    return _c;
  }
}

export class ModulationChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, MODULATION_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v > 0;
  }

  clone(): Channel {
    let _c = new (this.constructor as any)();
    let _g: ChannelObject = this.get();
    _c.assignFrom(_g);
    return _c;
  }
}

export class HarmonicityChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, HARMONICITY_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, Number) && v > 0
  }
}

export class TimbreChannel extends Channel {
  constructor(f?: string, t?: EncodingType) {
    super(f, t, TIMBRE_chn);
  }

  validator(v: any) {
    return isInstanceOf(v, String);
  }
}