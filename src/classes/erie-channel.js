import { OscTypes } from "./erie-synth";
import { Tick } from "./erie-tick";
import { DoubleOps, SingleOps, ZeroOPs } from "./erie-transform-aggregate";
import { deepcopy, isArrayOf, isInstanceOf, isInstanceOfByName } from "./erie-util";

const QUANT = 'quantitative', ORD = 'ordinal', NOM = 'nominal', TMP = 'temporal', STATIC = 'static';
const SupportedEncodingTypes = [QUANT, ORD, NOM, TMP, STATIC];
const POS = 'positive', NEG = 'negative';
const SupportedPolarity = [POS, NEG];
const RampMethods = [true, false, 'abrupt', 'linear', 'exponential'];
const SingleTapPosOptions = ['start', 'middle', 'end'];

import {
  REPEAT_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  TIME_chn
} from "./erie-channel-constants.js";

const REL = 'relative', ABS = 'absolute', SIM = 'simultaneous';
const TIMINGS = [REL, ABS, SIM];
const FormatTypes = ['number', 'datetime'];

export class Channel {
  constructor(f, t) {
    this.defined = false;
    this._channel = undefined;
    this._field;
    this._type;
    if (f) {
      this.field(f, t);
    }
    this._ramp = 'linear';
    this._aggregate;
    this._bin;
    this._scale = {};
    this._condition;
    this._value;
    this._format;
    this._formatType;
  }

  set(c) {
    if (isInstanceOfByName(c, `TimeChannel`) ||
      isInstanceOfByName(c, `Time2Channel`) ||
      isInstanceOfByName(c, `DurationChannel`) ||
      isInstanceOfByName(c, `TapSpeedChannel`) ||
      isInstanceOfByName(c, `TapCountChannel`) ||
      isInstanceOfByName(c, `PitchChannel`) ||
      isInstanceOfByName(c, `DetuneChannel`) ||
      isInstanceOfByName(c, `LoudnessChannel`) ||
      isInstanceOfByName(c, `PanChannel`) ||
      isInstanceOfByName(c, `PostReverbChannel`) ||
      isInstanceOfByName(c, `SpeechBeforeChannel`) ||
      isInstanceOfByName(c, `SpeechAfterChannel`) ||
      isInstanceOfByName(c, `RepeatChannel`) ||
      isInstanceOfByName(c, `ModulationChannel`) ||
      isInstanceOfByName(c, `HarmonicityChannel`) ||
      isInstanceOfByName(c, `Channel`)
    ) {
      let g = c.get();
      Object.assign(this, g);
    }
  }

  field(f, t) {
    if (f === undefined) {
      this._field = undefined;
    } else if (isInstanceOf(f, String)) {
      this._field = f;
    } else if (this._channel === REPEAT_chn && isArrayOf(f, String)) {
      this._field = f;
    } else {
      throw new TypeError('A field for an encoding channel must be a String.');
    }
    if (t) this.type(t);
    this.defined = true;
    return this;
  }

  type(t) {
    if (isInstanceOf(t, String) && SupportedEncodingTypes.includes(t)) {
      this._type = t;
    } else {
      throw new TypeError(`A type for an encoding channel must be a String and either one of ${SupportedEncodingTypes.join(', ')}.`);
    }

    return this;
  }

  ramp(r) {
    if (RampMethods.includes(r)) {
      if (isInstanceOf(r, String)) {
        this._ramp = r;
      } else {
        this._ramp = r ? 'linear' : 'abrupt';
      }
    } else {
      throw new TypeError(`A ramping method for an encoding channel must be either one of ${RampMethods.join(', ')}.`);
    }
  }

  aggregate(op) {
    if (ZeroOPs.includes(op)) {
      if (this._field) {
        console.warn('A count aggregate will drop the existing field.');
      }
      this._aggregate = op;
      this._type = QUANT;
      this.defined = true;
    } else if (SingleOps.includes(op)) {
      this._aggregate = op;
      this._type = QUANT;
      this.defined = true;
    } else if (DoubleOps.includes(op)) {
      throw new TypeError('An aggregate operation for two fields cannot be declared here.');
    } else {
      throw new TypeError(`The provided operation ${op} is not supported.`);
    }

    return this;
  }

  bin(...args) {
    // polymorph
    let is_bin, nice, maxbins, step, exact;
    if (args.length == 1) {
      if (isInstanceOf(args[0], Boolean)) {
        is_bin = args[0];
      } else if (isArrayOf(args[0], Number)) {
        is_bin = true;
        exact = args[0];
      }
    } else if (args.length >= 2 && args.length <= 3) {
      is_bin = true;
      [maxbins, nice, step] = args;
    } else {
      throw new TypeError(`Wrong argumetn is provided for a channel's bin.`);
    }

    this._bin = is_bin;
    if (maxbins || nice || step) {
      this._bin = {
        maxbins, nice, step
      };
    }
    this.defined = true;

    return this;
  }

  scale(p, v) {
    if (p === 'domain' && isInstanceOf(v, Array)) {
      this._scale.domain = [...v];
    } else if (p === 'range' && isInstanceOf(v, Object) && v.field) {
      this._scale.range = deepcopy(v);
    } else if (p === 'range' && isInstanceOf(v, Array)) {
      if (v.every(this.validator)) {
        this._scale.range = [...v];
        if (this._scale.times !== undefined ||
          this._scale.maxDistinct !== undefined) {
          console.warn('Existing scale settings will be ignored.')
          this._scale.times = undefined;
          this._scale.maxDistinct = undefined;
        }
      } else {
        throw new TypeError('Unsupported value type');
      }
    } else if (p === 'order' && isInstanceOf(v, Array)) {
      this._scale.order = v;
    } else if (p === 'polarity' && SupportedPolarity.includes(v)) {
      this._scale.polarity = v;
    } else if (p === 'maxDistinct' && isInstanceOf(v, Boolean)) {
      this._scale.maxDistinct = v;
      if (this._scale.range !== undefined ||
        this._scale.times !== undefined) {
        console.warn('Existing scale settings will be ignored.')
        this._scale.range = undefined;
        this._scale.times = undefined;
      }
    } else if (p === 'times' && isInstanceOf(v, Number)) {
      this._scale.times = v;
      if (this._scale.range !== undefined ||
        this._scale.maxDistinct !== undefined) {
        console.warn('Existing scale settings will be ignored.')
        this._scale.range = undefined;
        this._scale.maxDistinct = undefined;
      }
    } else if (p === 'zero' && isInstanceOf(v, Boolean)) {
      this._scale.zero = v;
    } else if (p === 'description' && (isInstanceOf(v, String) || v == null)) {
      this._scale.description = v;
    } else if (p === 'title' && (isInstanceOf(v, String) || v == null)) {
      this._scale.title = v;
    } else if (this._channel === TIME_chn && p === 'length' && isInstanceOf(v, Number)) {
      this._scale.length = v;
    } else if ([TIME_chn, TAPCNT_chn, TAPSPD_chn].includes(this._channel) && p === 'band' && isInstanceOf(v, Number)) {
      this._scale.band = v;
    } else if (this._channel === TIME_chn && p === 'timing' && TIMINGS.includes(v)) {
      this._scale.timing = v;
    } else if (this._channel === TAPSPD_chn && p === 'singleTappingPosition' && SingleTapPosOptions.includes(v)) {
      this._scale.timing = v;
    } else {
      throw new Error('The provide key and value is not a supported scale option.')
    }
    this.defined = true;

    return this;
  }

  addCondition(c, o) {
    if (isInstanceOf(c, String) && o !== undefined) {
      if (!this._condition) this._condition = [];
      this._condition.push({
        test: c,
        value: o
      });
      if (this._type !== STATIC) {
        console.warn('The type of this channel is changed to static, and the scales will be droped.')
        this._type = STATIC;
        this._scale = {};
      }
    } else {
      throw new Error('The provide condition and value is not a supported condition.')
    }
    this.defined = true;

    return this;
  }

  addConditions(c) {
    for (const cond of c) {
      if (cond.test && cond.value) this.addCondition(cond.test, cond.value);
    }
    this.defined = true;

    return this;
  }

  getConditions() {
    return this._condition ? deepcopy(this._condition) : this._condition;
  }

  removeCondition(i) {
    if (isInstanceOf(this._condition, Array)) {
      this._condition.splice(i, 1);
    }
  }

  resetCondition() {
    return this._condition = undefined;
  }

  value(v) {
    if (this.validator(v)) {
      this._value = v;
      if (this._type !== STATIC) {
        console.warn('The type of this channel is changed to static, and the scales will be droped.')
        this._type = STATIC;
        this._scale = {};
        this._field = undefined;
        this._aggregate = undefined;
        this._bin = undefined;
      }
    } else {
      throw new TypeError('Unsupported value type');
    }
    this.defined = true;

    return this;
  }

  speech(v) {
    if (this._channel === REPEAT_chn) {
      if (isInstanceOf(v, Boolean)) {
        this._speech = v;
      } else {
        throw new TypeError('The "speech" option for a channel must be Boolean.')
      }
    } else {
      throw new Error('Speech option is only for a repeat channel.')
    }
    this.defined = true;

    return this;
  }

  tick(k, v) {
    if (this._channel === TIME_chn) {
      if (isInstanceOf(k, String)) {
        if (!this._tick) this._tick = {};
        if (k === 'name' && isInstanceOf(v, String)) {
          this._tick.name = v;
        } else if (k === 'interval' && isInstanceOf(v, Number)) {
          this._tick.interval = v;
        } else if (k === 'playAtTime0' && isInstanceOf(v, Boolean)) {
          this._tick.playAtTime0 = v;
        } else if (k === 'oscType' && OscTypes.includes(v)) {
          this._tick.playAtTime0 = v;
        } else if (k === 'pitch' && isInstanceOf(v, Number)) {
          this._tick.pitch = v;
        } else if (k === 'loudness' && isInstanceOf(v, Number) && 0 <= v && v <= 1) {
          this._tick.loudness = v;
        }
      } else if (isInstanceOf(k, Tick)) {
        this._tick = { name: k._name };
      } else {
        throw new TypeError('The "speech" option for a channel must be Boolean.')
      }
    } else {
      throw new Error('Speech option is only for a time channel.')
    }
    this.defined = true;

    return this;
  }

  format(f, t) {
    if (f && t && isInstanceOf(f, String) && FormatTypes.includes(t)) {
      this._format = f;
      this._formatType = t;
    } else if (f && isInstanceOf(f, String)) {
      this._format = f;
    } else {
      throw new TypeError(`The "format" should be a String and "formatType" should be either ${FormatTypes.join(", ")}.`)
    }
  }

  formatType(t) {
    if (FormatTypes.includes(t)) {
      this._formatType = t;
    } else {
      throw new TypeError(`The "formatType" should be either ${FormatTypes.join(", ")}.`)
    }
  }

  get() {
    let o = {
      type: this._type,
      field: this._field,
      channel: this._channel,
      aggregate: this._aggregate,
      bin: this._bin ? deepcopy(this._bin) : this._bin,
      scale: this._scale ? deepcopy(this._scale) : this._scale,
      value: this._value,
      condition: this._condition ? deepcopy(this._condition) : this._condition,
      ramp: this._ramp,
      defined: this.defined
    };
    if (this._channel === TIME_chn) {
      o.tick = this._tick ? deepcopy(this._tick) : this._tick;
    }
    if (this._channel === REPEAT_chn) {
      o.tick = this._speech;
    }

    return o;
  }

  validator(v) {
    return true;
  }

  clone() {
    let _c = new this.constructor();
    let _g = this.get();
    Object.keys(_g).forEach(k => {
      if (k !== 'defined') {
        _c['_' + k] = _g[k];
      } else {
        _c.defined = _g[k]
      }
    });

    return _c;
  }
}