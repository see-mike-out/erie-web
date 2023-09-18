// types
export const NOM = "nominal", ORD = "ordinal", QUANT = "quantitative", TMP = "temporal", STATIC = "static";
// polarity
export const POS = "positive", NEG = 'negative';
// scale keywords
export const MaxDistinct = 'maxDistinct';
// channels
export const TIME_chn = "time",
  TIME2_chn = "time2",
  DUR_chn = "duration",
  TAPCNT_chn = "tapCount",
  TAPSPD_chn = "tapSpeed",
  POST_REVERB_chn = "postReverb",
  PITCH_chn = "pitch",
  DETUNE_chn = "detune",
  LOUDNESS_chn = "loudness",
  PAN_chn = "pan",
  SPEECH_chn = "speech",
  SPEECH_BEFORE_chn = "speechBefore",
  SPEECH_AFTER_chn = "speechAfter",
  TIMBRE_chn = "timbre",
  REPEAT_chn = "repeat",
  MODULATION_chn = 'modulation',
  HARMONICITY_chn = 'harmonicity';

// default caps
export const
  MIN_TIME = 0, MAX_TIME = 5,
  MIN_PITCH = 207.65, MAX_PITCH = 1600, MAX_LIMIT_PITCH = 3000,
  MAX_DETUNE = -1200, MIN_DETUNE = 1200,
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

// quant scale types
export const LINEAR = "linear", SQRT = "sqrt", POW = "pow", LOG = "log", SYMLOG = "symlog";

// tminig
export const REL_TIMING = 'relative', ABS_TIMING = 'absolute', SIM_TIMING = 'simultaneous';

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

// composition

export const SEQUENCE = 'sequence', OVERLAY = 'overlay';

// ramping
export const RampMethods = [true, false, 'abrupt', 'linear', 'exponential'];