import { Tick } from "./erie-tick";
import { FormatType } from "vega";
import { deepcopy } from "../util";
import {
  isArrayOf,
  isInstanceOf,
  isInstanceOfByName
} from "./erie-util";
import {
  REPEAT_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  TIME_chn,
  EncodingType,
  RampType,
  QUANT,
  STATIC,
  ScaleType,
  Condition,
  KeyDomain,
  KeyRange,
  KeyOrder,
  KeyPolarity,
  SupportedPolarity,
  KeyMaxDistinct,
  KeyTimes,
  KeyZero,
  KeyDescription,
  KeyTitle,
  KeyLength,
  KeyBand,
  SingleTapPosOptions,
  KeySingleTappingPosition,
  KeyTiming,
  TIMINGS,
  Condition1,
  Condition2,
  Condition3,
  TickKeys,
  TickKeyName,
  TickKeyInterval,
  TickKeyPlayAtTime0,
  TickKeyOscType,
  TickKeyPitch,
  TickKeyLoudness,
  ChannelObject,
  AggOpType,
  InlineBinType,
  AVG,
  CORR,
  COUNT,
  COVARIANCE,
  COVARIANCEP,
  DISTINCT,
  MAX,
  MEAN,
  MEDIAN,
  MIN,
  MODE,
  PRODUCT,
  QUANTILE,
  STDEV,
  STDEVP,
  SUM,
  VALID,
  VARIANCE,
  VARIANCEP,
  OscTypes
} from "../types";

export class Channel {
  defined: boolean;
  _channel: string | undefined;
  _field: string | undefined;
  _type: EncodingType | undefined;
  _ramp: RampType | undefined;
  _aggregate: AggOpType | undefined;
  _bin: InlineBinType | undefined;
  _scale: ScaleType;
  _condition: Condition | undefined;
  _value: any | undefined;
  _format: string | undefined;
  _formatType: FormatType | undefined;
  _speech: boolean | undefined;
  _tick: any;
  _roundToNote?: boolean;

  constructor(f?: string, t?: EncodingType) {
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

  set(c: Channel) {
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

  field(f: string | undefined, t: EncodingType | undefined) {
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

  type(t: EncodingType) {
    this._type = t;
    return this;
  }

  ramp(r: RampType) {
    if (isInstanceOf(r, String)) {
      this._ramp = r;
    } else {
      this._ramp = r ? 'linear' : 'abrupt';
    }
  }

  aggregate(op: AggOpType) {
    switch (op) {
      case COUNT:
        if (this._field) {
          console.warn('A count aggregate will drop the existing field.');
        }
        this._aggregate = op;
        this._type = QUANT;
        this.defined = true;
        break;
      case VALID:
      case DISTINCT:
      case MEAN:
      case AVG:
      case MODE:
      case MEDIAN:
      case QUANTILE:
      case STDEV:
      case STDEVP:
      case VARIANCE:
      case VARIANCEP:
      case SUM:
      case PRODUCT:
      case MAX:
      case MIN:
        this._aggregate = op;
        this._type = QUANT;
        this.defined = true;
        break;
      case CORR:
      case COVARIANCE:
      case COVARIANCEP:
        throw new TypeError('An aggregate operation for two fields cannot be declared here.');
    }
    return this;
  }

  bin(...args: any) {
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
      throw new TypeError(`Wrong argument is provided for a channel's bin.`);
    }

    this._bin = is_bin;
    if (maxbins || nice || step) {
      this._bin = {
        maxbins, nice, step
      };
    } else if (exact) {
      this._bin = { exact };
    }
    this.defined = true;

    return this;
  }

  scale(p: keyof ScaleType, v: any) {
    if (p === KeyDomain && v instanceof Array) {
      this._scale.domain = [...v];
    } else if (p === KeyRange && v instanceof Object && v.field) {
      this._scale.range = deepcopy(v);
    } else if (p === KeyRange && isInstanceOf(v, Array)) {
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
    } else if (p === KeyOrder && isInstanceOf(v, Array)) {
      this._scale.order = v;
    } else if (p === KeyPolarity && SupportedPolarity.includes(v)) {
      this._scale.polarity = v;
    } else if (p === KeyMaxDistinct && isInstanceOf(v, Boolean)) {
      this._scale.maxDistinct = v;
      if (this._scale.range !== undefined ||
        this._scale.times !== undefined) {
        console.warn('Existing scale settings will be ignored.')
        this._scale.range = undefined;
        this._scale.times = undefined;
      }
    } else if (p === KeyTimes && isInstanceOf(v, Number)) {
      this._scale.times = v;
      if (this._scale.range !== undefined ||
        this._scale.maxDistinct !== undefined) {
        console.warn('Existing scale settings will be ignored.')
        this._scale.range = undefined;
        this._scale.maxDistinct = undefined;
      }
    } else if (p === KeyZero && isInstanceOf(v, Boolean)) {
      this._scale.zero = v;
    } else if (p === KeyDescription && (isInstanceOf(v, String) || v == null)) {
      this._scale.description = v;
    } else if (p === KeyTitle && (isInstanceOf(v, String) || v == null)) {
      this._scale.title = v;
    } else if (this._channel === TIME_chn && p === KeyLength && isInstanceOf(v, Number)) {
      this._scale.length = v;
    } else if ([TIME_chn, TAPCNT_chn, TAPSPD_chn].includes(<string>this._channel) && p === KeyBand && isInstanceOf(v, Number)) {
      this._scale.band = v;
    } else if (this._channel === TIME_chn && p === KeyTiming && TIMINGS.includes(v)) {
      this._scale.timing = v;
    } else if (this._channel === TAPSPD_chn && p === KeySingleTappingPosition && SingleTapPosOptions.includes(v)) {
      this._scale.timing = v;
    } else {
      throw new Error('The provide key and value is not a supported scale option.')
    }
    this.defined = true;

    return this;
  }

  addCondition(c: Condition1 | Condition2 | Condition3, o: any) {
    if ((isInstanceOf(c, String)
      || c instanceof Array
      || (!(c instanceof Array) && c instanceof Object && c.not !== undefined))
      && o !== undefined) {
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

  addConditions(c: Condition) {
    for (const cond of c) {
      if (cond.test && cond.value) this.addCondition(cond.test, cond.value);
    }
    this.defined = true;

    return this;
  }

  getConditions() {
    return this._condition ? deepcopy(this._condition) : this._condition;
  }

  removeCondition(i: number) {
    if (this._condition instanceof Array) {
      this._condition.splice(i, 1);
    }
  }

  resetCondition() {
    return this._condition = undefined;
  }

  value(v: any) {
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

  speech(v: boolean) {
    if (this._channel === REPEAT_chn) {
      this._speech = v;
    } else {
      throw new Error('Speech option is only for a repeat channel.')
    }
    this.defined = true;

    return this;
  }

  tick(k: TickKeys | Tick, v: any) {
    if (this._channel === TIME_chn) {
      if (isInstanceOf(k, String)) {
        if (!this._tick) this._tick = {};
        if (k === TickKeyName && isInstanceOf(v, String)) {
          this._tick.name = v;
        } else if (k === TickKeyInterval && isInstanceOf(v, Number)) {
          this._tick.interval = v;
        } else if (k === TickKeyPlayAtTime0 && isInstanceOf(v, Boolean)) {
          this._tick.playAtTime0 = v;
        } else if (k === TickKeyOscType && OscTypes.includes(v)) {
          this._tick.playAtTime0 = v;
        } else if (k === TickKeyPitch && isInstanceOf(v, Number)) {
          this._tick.pitch = v;
        } else if (k === TickKeyLoudness && isInstanceOf(v, Number) && 0 <= v && v <= 1) {
          this._tick.loudness = v;
        }
      } else if (isInstanceOf(k, Tick)) {
        this._tick = { name: (<Tick>k)._name };
      } else {
        throw new TypeError('The "speech" option for a channel must be Boolean.')
      }
    } else {
      throw new Error('Speech option is only for a time channel.')
    }
    this.defined = true;

    return this;
  }

  format(f: string, t: FormatType) {
    if (f && t && isInstanceOf(f, String)) {
      this._format = f;
      this._formatType = t;
    } else if (f && isInstanceOf(f, String)) {
      this._format = f;
    }
  }

  formatType(t: FormatType) {
    this._formatType = t;
  }

  get(): ChannelObject {
    let o: ChannelObject = {
      type: this._type,
      field: this._field,
      channel: this._channel,
      aggregate: this._aggregate,
      bin: this._bin ? deepcopy(this._bin) : this._bin,
      scale: this._scale ? deepcopy(this._scale) : this._scale,
      value: this._value,
      condition: this._condition ? deepcopy(this._condition) : this._condition,
      ramp: this._ramp,
      defined: this.defined,
      roundToNote: this._roundToNote
    };
    if (this._channel === TIME_chn) {
      o.tick = this._tick ? deepcopy(this._tick) : this._tick;
    }
    if (this._channel === REPEAT_chn) {
      o.tick = this._speech;
    }

    return o;
  }

  validator(v: any) {
    return true;
  }

  clone(): Channel {
    let _c: Channel = new Channel(undefined, undefined);
    let _g: ChannelObject = this.get();
    Object.keys(_g).forEach(k => {
      let ck = k === "defined" ? k : "_" + k;
      _c[<keyof Channel>ck] = _g[<keyof ChannelObject>k];
    });
    return _c;
  }
}
