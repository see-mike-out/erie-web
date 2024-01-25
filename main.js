import { Data } from './src/classes/erie-data';
import { Dataset, Datasets } from './src/classes/erie-datasets';
import { Transform } from './src/classes/erie-transform';
import { Aggregate } from './src/classes/erie-transform-aggregate';
import { Bin } from './src/classes/erie-transform-bin';
import { Filter } from './src/classes/erie-transform-filter';
import { Calculate } from './src/classes/erie-transform-calculate';
import { Fold } from './src/classes/erie-transform-fold';
import { Density } from './src/classes/erie-transform-density';
import { Tone } from "./src/classes/erie-tone";
import { WaveTone, Wave } from "./src/classes/erie-wave";
import { SynthTone, Synth } from "./src/classes/erie-synth";
import { SampledTone, Sampling } from "./src/classes/erie-sampling";
import { Channel } from "./src/classes/erie-channel";
import { Stream } from './src/classes/erie-stream';
import { Sequence } from "./src/classes/erie-sequence";
import { Overlay } from "./src/classes/erie-overlay";
import { DurationChannel, LoudnessChannel, ModulationChannel, PanChannel, PitchChannel, PostReverbChannel, RepeatChannel, SpeechAfterChannel, SpeechBeforeChannel, TapCountChannel, TapSpeedChannel, Time2Channel, TimeChannel } from './src/classes/erie-channels';
import { Tick } from './src/classes/erie-tick';
import { Config } from './src/classes/erie-config';
import { ErieFilters, registerFilter } from './src/classes/erie-audio-filter';
import { compileAuidoGraph, readyRecording } from './src/audio-graph';
import { setSampleBaseUrl, ErieSampleBaseUrl } from './src/base.js';

export {
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
  Sequence,
  Overlay,
  Config,
  ErieFilters,
  registerFilter,
  compileAuidoGraph,
  readyRecording,
  setSampleBaseUrl,
  ErieSampleBaseUrl
}