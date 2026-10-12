import { Tick } from "./erie-tick";
import { deepcopy, isEmptyObject, isInRange } from "../util";
import {
  isArrayOf,
  isInstanceOf
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
  OscTypes,
  KeyType,
  SupportedScaleTypes,
  KeyBase,
  KeyConstant,
  KeyExponent,
  KeyDomainMax,
  KeyDomainMid,
  KeyDomainMin,
  KeyRangeMax,
  KeyRangeMid,
  KeyRangeMin,
  KeySort,
  SupportedSortValues,
  FormatType,
  timeLevelValues,
  timeUnitDomainDefs,
  SortValues,
  ChannelSpec,
  TickKeyBand
} from "../types";

export class Channel {
  defined: boolean;
  _channel: string | undefined;
  _field: string | string[] | undefined;
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
  _by?: string[] | string;
  _p?: number | undefined;
  _sort?: SortValues;
  _timeUnit?: keyof typeof timeUnitDomainDefs;
  _timeUnitName?: string | string[] | number[];
  _timeLevel?: timeLevelValues;
  _sustain?: boolean;

  constructor(f?: string | string[], t?: EncodingType, c?: string) {
    this.defined = false;
    this._channel = c;
    this._field = undefined;
    this._type = undefined;
    if (f) {
      this.field(f, t);
    }
    this._ramp = 'linear';
    this._aggregate = undefined;
    this._bin = undefined;
    this._scale = {};
    this._condition = undefined;
    this._value = undefined;
    this._format = undefined;
    this._formatType = undefined;
    this._speech = undefined;
    this._by = undefined;
    this._p = undefined;
    this._sort = undefined;
    this._timeUnit = undefined;
    this._timeUnitName = undefined;
    this._timeLevel = undefined;
  }

  set(c: Channel) {
    if (!(c instanceof Channel)) {
      throw new TypeError("channel.set expects a Channel object.");
    }
    const own = this._channel;
    this.assignFrom(c.get());
    this._channel = own;
    return this;
  }
  protected assignFrom(g: ChannelObject) {
    for (const [k, v] of Object.entries(g)) {
      const ck = k === 'defined' ? k : '_' + k;
      (this as any)[ck] = v === undefined ? v : deepcopy(v);
    }
  }
  field(f: string | string[] | undefined, t?: EncodingType | undefined) {
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
    return this;
  }

  aggregate(op: AggOpType, p?: number) {
    switch (op) {
      case COUNT:
        if (this._field) {
          this._field = undefined;
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
        if (p !== undefined) {
          throw new RangeError(`The ${op} operator does not accept a parameter.`);
        }
        break;
      case QUANTILE:
        if (p !== undefined && isInstanceOf(p, Number) && isInRange(p, 0, 1)) {
          this._aggregate = op;
          this._type = QUANT;
          this.defined = true;
          this._p = p;
        } else if (p !== undefined) {
          throw new RangeError('Wrong quantile parameter.');
        } else {
          this._aggregate = op;
          this._type = QUANT;
          this.defined = true;
          this._p = 0.5;
        }
        break;
      case CORR:
      case COVARIANCE:
      case COVARIANCEP:
        throw new TypeError('An aggregate operation for two fields cannot be declared here.');
      default:
        throw new TypeError('Unknown operation: ' + op);
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
      } else {
        throw new TypeError(`Wrong bin value: [${args.join(", ")}]`)
      }
    } else if (isInRange(args.length, 2, 3)) {
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
      this._scale.singleTappingPosition = v;
    } else if (p == KeyType && SupportedScaleTypes.includes(v)) {
      this._scale.type = v;
    } else if (p == KeyBase && isInstanceOf(v, Number)) {
      this._scale.base = v;
    } else if (p == KeyConstant && isInstanceOf(v, Number)) {
      this._scale.constant = v;
    } else if (p == KeyExponent && isInstanceOf(v, Number)) {
      this._scale.exponent = v;
    } else if (p == KeyDomainMax && v !== undefined) {
      this._scale.domainMax = v;
    } else if (p == KeyDomainMid && v !== undefined) {
      this._scale.domainMid = v;
    } else if (p == KeyDomainMin && v !== undefined) {
      this._scale.domainMin = v;
    } else if (p == KeyRangeMax && v !== undefined) {
      this._scale.rangeMax = v;
    } else if (p == KeyRangeMid && v !== undefined) {
      this._scale.rangeMid = v;
    } else if (p == KeyRangeMin && v !== undefined) {
      this._scale.rangeMin = v;
    } else if (p == KeySort && SupportedSortValues.includes(v)) {
      this._scale.sort = v;
    } else {
      throw new TypeError('The provide key and value is not a supported scale option.')
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
      if (cond.test !== undefined && cond.value !== undefined) this.addCondition(cond.test, cond.value);
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
    return this;
  }

  resetCondition() {
    this._condition = undefined;
    return this;
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

  tick(k: TickKeys | Tick, v?: any) {
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
          this._tick.oscType = v;
        } else if (k === TickKeyPitch && isInstanceOf(v, Number)) {
          this._tick.pitch = v;
        } else if (k === TickKeyLoudness && isInstanceOf(v, Number) && isInRange(v, 0, 1)) {
          this._tick.loudness = v;
        } else if (k === TickKeyBand && isInstanceOf(v, Number)) {
          this._tick.band = v;
        } else {
          throw new TypeError(`Wrong value for the tick ${k} option: ${v}`)
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

  format(f: string, t?: FormatType) {
    if (f && t && isInstanceOf(f, String)) {
      this._format = f;
      this._formatType = t;
    } else if (f && isInstanceOf(f, String)) {
      this._format = f;
    }
    return this;
  }

  formatType(t: FormatType) {
    this._formatType = t;
    return this;
  }

  by(b: string[] | string) {
    this._by = b;
    return this;
  }
  sort(s: SortValues) {
    this._sort = s;
    return this;
  }
  timeUnit(u: keyof typeof timeUnitDomainDefs, n?: string | string[] | number[]) {
    if (!Object.keys(timeUnitDomainDefs).includes(u)) {
      throw new TypeError("Wrong time unit: " + u)
    }
    this._timeUnit = u;
    this._timeUnitName = n;
    return this;
  }
  timeLevel(l: timeLevelValues) {
    this._timeLevel = l;
    return this;
  }

  sustain(s: boolean) {
    this._sustain = s;
    return this;
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
      roundToNote: this._roundToNote,
      format: this._format,
      formatType: this._formatType,
      by: this._by,
      p: this._p,
      sort: this._sort,
      timeUnit: this._timeUnit,
      timeUnitName: this._timeUnitName,
      timeLevel: this._timeLevel,
      sustain: this._sustain
    };
    if (this._channel === TIME_chn) {
      o.tick = this._tick ? deepcopy(this._tick) : this._tick;
    }
    if (this._channel === REPEAT_chn) {
      o.speech = this._speech;
    }

    return o;
  }

  toSpec(): ChannelSpec {
    let s = this.get() as any;
    delete s.defined;
    delete s.channel;
    if (isEmptyObject(s.scale)) {
      delete s.scale;
    }
    return s as ChannelSpec;
  }

  validator(v: any) {
    return true;
  }

  clone(): Channel {
    let _c = new (this.constructor as any)();
    let _g: ChannelObject = this.get();
    _c.assignFrom(_g);
    return _c;
  }
}
