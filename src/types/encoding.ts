import { AggOpType, InlineBinType } from "./transform";
import { OscType } from "./synth";

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

// SCALE
// polarity
export const POS = 'positive',
  NEG = 'negative';
export const SupportedPolarity = [POS, NEG];
export type PolarityType = typeof POS
  | typeof NEG;


// timing
export const REL = 'relative',
  ABS = 'absolute',
  SIM = 'simultaneous';
export const TIMINGS = [REL, ABS, SIM];
export type TimingType = typeof REL
  | typeof ABS
  | typeof SIM;

// quant scale types
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

// single tapping
export const Start = 'start',
  Middle = 'middle',
  End = 'end';

export const SingleTapPosOptions = [Start, Middle, End];

export type SingleTapPosType = typeof Start
  | typeof Middle
  | typeof End;

// sort
export type SortValues = 'ascending' | 'asc' | 'descending' | 'desc' | true | false;


// sacle object
export const KeyDomain = 'domain',
  KeyRange = 'range',
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
  KeySingleTappingPosition = 'singleTappingPosition';

export type ScaleType = {
  id?: string,
  [KeyType]?: ScaleTransformType,
  [KeyDomain]?: any[],
  [KeyRange]?: any[],
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
  [KeySingleTappingPosition]?: SingleTapPosType
}

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


// format
export const NumberFormat = 'number',
  DateFormat = 'datetime';

export type FormatType = typeof NumberFormat | typeof DateFormat;


// tick
export const TickKeyName = 'name',
  TickKeyInterval = 'interval',
  TickKeyBand = 'band',
  TickKeyPlayAtTime0 = 'playAtTime0',
  TickKeyOscType = 'oscType',
  TickKeyPitch = 'pitch',
  TickKeyLoudness = 'loudness';

export type TickKeys = typeof TickKeyName
  | typeof TickKeyInterval
  | typeof TickKeyBand
  | typeof TickKeyPlayAtTime0
  | typeof TickKeyOscType
  | typeof TickKeyPitch
  | typeof TickKeyLoudness;

export interface TickObject {
  name?: string,
  interval?: number,
  band?: number,
  playAtTime0?: boolean,
  oscType?: OscType,
  pitch?: number
  loudness?: number
}


// Channels
// Channel names
export const TIME_chn = "time",
  TIME2_chn = "time2",
  DUR_chn = "duration",
  TAPCNT_chn = "tapCount",
  TAPSPD_chn = "tapSpeed",
  POST_REVERB_chn = "postReverb",
  PITCH_chn = "pitch",
  LOUDNESS_chn = "loudness",
  PAN_chn = "pan",
  SPEECH_chn = "speech",
  SPEECH_BEFORE_chn = "speechBefore",
  SPEECH_AFTER_chn = "speechAfter",
  TIMBRE_chn = "timbre",
  MODULATION_chn = "modulation",
  HARMONICITY_chn = "harmonicity",
  DETUNE_chn = "detune",
  REPEAT_chn = "repeat";

export type ChannelName = typeof TIME_chn
  | typeof TIME2_chn
  | typeof DUR_chn
  | typeof TAPCNT_chn
  | typeof TAPSPD_chn
  | typeof POST_REVERB_chn
  | typeof PITCH_chn
  | typeof LOUDNESS_chn
  | typeof PAN_chn
  | typeof SPEECH_chn
  | typeof SPEECH_BEFORE_chn
  | typeof SPEECH_AFTER_chn
  | typeof TIMBRE_chn
  | typeof MODULATION_chn
  | typeof HARMONICITY_chn
  | typeof DETUNE_chn
  | typeof REPEAT_chn;

// Channel object
export interface ChannelObject {
  defined: boolean,
  channel: string | undefined,
  field?: string | undefined,
  type?: EncodingType | undefined,
  ramp?: RampType | undefined,
  aggregate?: AggOpType | undefined,
  bin?: InlineBinType | undefined,
  scale?: ScaleType,
  condition?: Condition | undefined,
  value?: any | undefined,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  speech?: boolean | undefined,
  tick?: TickObject | string,
  roundToNote?: boolean
}

// channel categories
export const TimeChannels = [
  TIME_chn,
  TIME2_chn
];
export const NonTimeChannels = [
  PITCH_chn,
  DETUNE_chn,
  LOUDNESS_chn,
  PAN_chn,
  DUR_chn,
  SPEECH_BEFORE_chn,
  SPEECH_AFTER_chn,
  POST_REVERB_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  MODULATION_chn,
  HARMONICITY_chn
];
export const SpeechChannels = [
  SPEECH_chn,
  SPEECH_BEFORE_chn,
  SPEECH_AFTER_chn
];
export const TapChannels = [
  TAPCNT_chn,
  TAPSPD_chn
];
export const DefaultChannels = [
  TIME_chn,
  TIME2_chn,
  PITCH_chn,
  DETUNE_chn,
  LOUDNESS_chn,
  PAN_chn,
  DUR_chn,
  SPEECH_chn,
  SPEECH_BEFORE_chn,
  SPEECH_AFTER_chn,
  POST_REVERB_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  MODULATION_chn,
  HARMONICITY_chn
]

// Defualt values


// default caps
export const
  MIN_TIME = 0, MAX_TIME = 5,
  MIN_PITCH = 207.65, MAX_PITCH = 1600, MAX_LIMIT_PITCH = 3000,
  MAX_DETUNE = 1200, MIN_DETUNE = -1200,
  MIN_LOUD = 0, MAX_LOUD = 10,
  MIN_PAN = -1, MAX_PAN = 1,
  MIN_DUR = 0, MAX_DUR = 20, DEF_DUR = 0.5,
  MIN_POST_REVERB = 0, MAX_POST_REVERB = 4,
  MIN_TAP_COUNT = 0, MAX_TAP_COUNT = 25,
  MIN_TAP_SPEED = 0, MAX_TAP_SPEED = 5, MAX_LIMIT_TAP_SPEED = 7,
  DEF_SPEECH_RATE = 1.75;

// defaults
export const defaultTapLength = 0.2;

export const ChannelThresholds = {
  [TIME_chn]: { min: 0 },
  [PITCH_chn]: { max: MAX_PITCH, min: MIN_PITCH },
  [DETUNE_chn]: { max: MAX_DETUNE, min: MIN_DETUNE },
  [LOUDNESS_chn]: { max: MAX_LOUD, min: MIN_LOUD },
  [PAN_chn]: { max: MAX_PAN, min: MIN_PAN },
  [DUR_chn]: { max: MAX_DUR, min: MIN_DUR },
  [POST_REVERB_chn]: { max: MAX_POST_REVERB, min: 0 },
  [TAPCNT_chn]: { max: MAX_TAP_COUNT, min: 0 },
  [TAPSPD_chn]: { max: MAX_TAP_SPEED, min: MIN_TAP_SPEED }
};

// cap values if exceeding
export const ChannelCaps = {
  [TIME_chn]: { max: Infinity, min: MIN_TIME },
  [PITCH_chn]: { max: MAX_LIMIT_PITCH, min: 0 },
  [DETUNE_chn]: { max: MAX_DETUNE, min: MIN_DETUNE },
  [LOUDNESS_chn]: { max: Infinity, min: -Infinity },
  [PAN_chn]: { max: MAX_PAN, min: MIN_PAN },
  [DUR_chn]: { max: Infinity, min: MIN_DUR },
  [POST_REVERB_chn]: { max: Infinity, min: 0 },
  [TAPCNT_chn]: { max: Infinity, min: 0 },
  [TAPSPD_chn]: { max: MAX_LIMIT_TAP_SPEED, min: MIN_TAP_SPEED }
};


// tapping
// TAPPING: each tap sound
// TAP: entire tappings
export const
  DEF_TAP_PAUSE_RATE = 0.4,
  MAX_TAPPING_DUR = 0.3,
  DEF_TAPPING_DUR = 0.2,
  DEF_TAPPING_DUR_BEAT = 1,
  DEF_TAP_DUR = 2,
  DEF_TAP_DUR_BEAT = 4,
  SINGLE_TAP_MIDDLE = 'middle',
  SINGLE_TAP_START = 'start',
  SINGLE_TAP_END = 'end';

// description related
export const ScaleDescriptionOrder = [
  REPEAT_chn,
  TIME_chn,
  TIMBRE_chn,
  DUR_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  PITCH_chn,
  DETUNE_chn,
  LOUDNESS_chn,
  PAN_chn,
  MODULATION_chn,
  HARMONICITY_chn,
  POST_REVERB_chn
], SKIP = 'skip', NONSKIP = 'nonskip', DEF_LEGEND_DUR = 0.5;