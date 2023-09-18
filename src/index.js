import { Data } from './classes/erie-data';
import { Dataset, Datasets } from './classes/erie-datasets';
import { Transform } from './classes/erie-transform';
import { Aggregate } from './classes/erie-transform-aggregate';
import { Bin } from './classes/erie-transform-bin';
import { Filter } from './classes/erie-transform-filter';
import { Calculate } from './classes/erie-transform-calculate';
import { Fold } from './classes/erie-transform-fold';
import { Density } from './classes/erie-transform-density';
import { Tone } from "./classes/erie-tone";
import { WaveTone, Wave } from "./classes/erie-wave";
import { SynthTone, Synth } from "./classes/eire-synth";
import { SampledTone, Sampling } from "./classes/erie-sampling";
import { Channel } from "./classes/erie-channel";
import { Stream } from './classes/erie-stream';
import { DurationChannel, LoudnessChannel, ModulationChannel, PanChannel, PitchChannel, PostReverbChannel, RepeatChannel, SpeechAfterChannel, SpeechBeforeChannel, TapCountChannel, TapSpeedChannel, Time2Channel, TimeChannel } from './classes/erie-channels';
import { Tick } from './classes/erie-tick';
import { Config } from './classes/eire-config';
import { registerFilter } from './classes/erie-audio-filter';
import { compileAuidoGraph } from './audio-graph';
import { setSampleBaseUrl, erieSampleBaseUrl } from './base.js';

export let Erie = {
  Data,
  Datasets,
  Dataset,
  Transform,
  Aggregate,
  Bin,
  Filter,
  Calculate,
  Fold,
  Density,
  Tone,
  Wave,
  WaveTone,
  Synth,
  SynthTone,
  Sampling,
  SampledTone,
  Tick,
  Channel,
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
  Stream,
  Config,
  registerFilter,
  compileAuidoGraph,
  setSampleBaseUrl,
  erieSampleBaseUrl
};

module.exports = Erie;