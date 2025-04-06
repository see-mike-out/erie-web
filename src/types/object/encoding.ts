import { SingleTapPosType, TimingType } from "./channel";

/*----- ENCODING -----*/
// encoding types
export const QUANT = 'quantitative',
  ORD = 'ordinal',
  NOM = 'nominal',
  TMP = 'temporal',
  STATIC = 'static';

export type EncodingType = typeof QUANT
  | typeof ORD
  | typeof NOM
  | typeof TMP
  | typeof STATIC;

// ranmping types
export const RampAbrupt = 'abrupt',
  RampLinear = 'linear',
  RampExp = 'exponential'

export type RampType = boolean
  | typeof RampAbrupt
  | typeof RampLinear
  | typeof RampExp;

export const RampMethods = [true, false, RampAbrupt, RampLinear, RampExp];

export type RampFunctionName = 'setValueAtTime' | 'linearRampToValueAtTime' | 'exponentialRampToValueAtTime' | 'setTargetAtTime';

// sort
export type SortValues = 'ascending' | 'asc' | 'descending' | 'desc' | true | false;

// conditions
export type Condition1 = any[];

export type Condition2 = {
  not: any[]
};

export type Condition3 = string;

export interface ConditionItem {
  test: Condition1 | Condition2 | Condition3,
  name?: string,
  value: any
}

export type Condition = ConditionItem[];

export type ConditionFunction = {
  test: (a: any) => boolean,
  name?: string,
  value: any
}

// format
export const NumberFormat = 'number',
  DateFormat = 'datetime',
  TimeFormat = 'time';

export type FormatType = typeof NumberFormat | typeof DateFormat | typeof TimeFormat;

/*----- SCALE -----*/
// polarity
export const POS = 'positive',
  NEG = 'negative';
export const SupportedPolarity = [POS, NEG];
export type PolarityType = typeof POS
  | typeof NEG;

// scale transformations
export const LINEAR = "linear",
  SQRT = "sqrt",
  POW = "pow",
  LOG = "log",
  SYMLOG = "symlog";

export type ScaleTransformType = typeof LINEAR
  | typeof SQRT
  | typeof POW
  | typeof LOG
  | typeof SYMLOG;


// sacle object
export const KeyDomain = 'domain',
  KeyDomainMin = 'domainMin',
  KeyDomainMax = 'domainMax',
  KeyDomainMid = 'domainMid',
  KeyRange = 'range',
  KeyRangeMin = 'rangeMin',
  KeyRangeMax = 'rangeMax',
  KeyRangeMid = 'rangeMid',
  KeyPolarity = 'polarity',
  KeyMaxDistinct = 'maxDistinct',
  KeyTimes = 'times',
  KeyZero = 'zero',
  KeyDescription = 'description',
  KeyTitle = 'title',
  KeyLength = 'length',
  KeyBand = 'band',
  KeyTiming = 'timing',
  KeyOrder = 'order',
  KeySort = 'sort',
  KeyType = 'type',
  KeyBase = 'base',
  KeyConstant = 'constant',
  KeyExponent = 'exponent',
  KeySingleTappingPosition = 'singleTappingPosition',
  KeyNice = 'nice',
  KeyPauseRate = 'pauseRate',
  KeyPauseLength = 'pauseLength',
  KeyMaxTappingLength = 'maxTappingLength';

export type FieldedRange = { field: string };

export type ScaleType = {
  id?: string,
  [KeyType]?: ScaleTransformType,
  [KeyBase]?: number,
  [KeyConstant]?: number,
  [KeyExponent]?: number,
  [KeyDomain]?: any[],
  [KeyDomainMin]?: any,
  [KeyDomainMax]?: any,
  [KeyDomainMid]?: any,
  [KeyRange]?: any[] | FieldedRange,
  [KeyRangeMin]?: any,
  [KeyRangeMax]?: any,
  [KeyRangeMid]?: any,
  [KeyOrder]?: any[],
  [KeySort]?: SortValues,
  [KeyPolarity]?: PolarityType,
  [KeyMaxDistinct]?: boolean,
  [KeyTimes]?: number,
  [KeyZero]?: boolean,
  [KeyDescription]?: string | null,
  [KeyTitle]?: string,
  [KeyLength]?: number,
  [KeyBand]?: number,
  [KeyTiming]?: TimingType,
  [KeySingleTappingPosition]?: SingleTapPosType,
  [KeyNice]?: boolean,
  [KeyPauseRate]?: number,
  [KeyPauseLength]?: number
  [KeyMaxTappingLength]?: number,
}