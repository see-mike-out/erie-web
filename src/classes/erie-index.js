import { Data } from './erie-data';
import { Dataset, Datasets } from './erie-datasets';
import { Transform } from './erie-transform';
import { Aggregate } from './erie-transform-aggregate';
import { Bin } from './erie-transform-bin';
import { Filter } from './erie-transform-filter';
import { Calculate } from './erie-transform-calculate';
import { Fold } from './erie-transform-fold';
import { Density } from './erie-transform-density';
import { Tone } from "./erie-tone";
import { WaveTone, Wave } from "./erie-wave";
import { SynthTone, Synth } from "./erie-synth";
import { SampledTone, Sampling } from "./erie-sampling";
import { Channel } from "./erie-channel";
import { Stream } from './erie-stream';
import { DurationChannel, LoudnessChannel, ModulationChannel, PanChannel, PitchChannel, PostReverbChannel, RepeatChannel, SpeechAfterChannel, SpeechBeforeChannel, TapCountChannel, TapSpeedChannel, Time2Channel, TimeChannel } from './erie-channels';
import { Tick } from './erie-tick';
import { Config } from './erie-config';
import { registerFilter } from './erie-audio-filter';

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
  registerFilter
};