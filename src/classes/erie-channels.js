import { Channel } from "./erie-channel.js";
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
  DETUNE_chn
} from "./erie-channel-constants.js";
import { isInstanceOf } from "./erie-util.js";


export class TimeChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = TIME_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

export class Time2Channel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = TIME2_chn;
  }
}

export class DurationChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = DUR_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

const MAX_LIMIT_TAP_SPEED = 7;
export class TapSpeedChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = TAPSPD_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_TAP_SPEED;
  }
}

export class TapCountChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = TAPCNT_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

const MAX_LIMIT_PITCH = 3000;
export class PitchChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = PITCH_chn;
    this.roundToNote = false;
  }

  roundToNote(v) {
    if (isInstanceOf(v, Boolean)) {
      this.roundToNote = v;
    } else {
      throw new TypeError('Round-to-note for a pitch channel must be Boolean');
    }
    return this;
  }

  validator(v) {
    return (isInstanceOf(v, Number) && v >= 0 && v <= MAX_LIMIT_PITCH) || (isInstanceOf(v, String) && v.match(/^[A-F][0-9]$/gi));
  }
}

export class DetuneChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = DETUNE_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= -1200 && v <= 1200;
  }
}

export class LoudnessChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = LOUDNESS_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number);
  }
}

export class PanChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = PAN_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= -1 && v <= 1;
  }
}

export class PostReverbChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = POST_REVERB_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v >= 0;
  }
}

export class SpeechBeforeChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = SPEECH_BEFORE_chn;
  }
}

export class SpeechAfterChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = SPEECH_AFTER_chn;
  }
}

export class RepeatChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = REPEAT_chn;
  }
}

export class ModulationChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = MODULATION_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v > 0;
  }
}

export class HarmonicityChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = HARMONICITY_chn;
  }

  validator(v) {
    return isInstanceOf(v, Number) && v > 0
  }
}

export class TimbreChannel extends Channel {
  constructor(f, t) {
    super(f, t);
    this._channel = TIMBRE_chn;
  }

  validator(v) {
    return isInstanceOf(v, String);
  }
}