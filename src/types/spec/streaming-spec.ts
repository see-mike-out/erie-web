import {
  ToneSpec,
  WaveSpec
} from "./tone"
import {
  StreamingChannelSpec,
  TickSpec
} from "./channel";
import { StreamingDataSpec } from "./data";
import { NotifySpec } from "./notify"
import { SampledToneSpec } from "./tone"
import { SynthSpec } from "./synth";
import { TransformListSpec } from "./transform";

export type StreamingSpec = {
  // single stream?
  title?: string,
  description?: string,
  name?: string,
  data: StreamingDataSpec, // user provided test data spec, not required
  transform?: TransformListSpec,
  tone: ToneSpec,
  // intentionally open definition because of custom channels
  encoding: {
    [key: string]: StreamingChannelSpec
  },
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[]

  // Streaming Specific
  playback?: PlaybackSpec,
  notify?: NotifySpec
}

export const PlaybackManual = 'manual', PlaybackConditional = 'conditional', PlaybackAuto = 'always';
export const PlaybackTypes = [PlaybackManual, PlaybackConditional, PlaybackAuto];

export const PlaybackUnitDatum = 'datum', PlaybackUnitTime = 'time', PlaybackUnitInstance = 'instance';
export const PlaybackUnits = [PlaybackUnitDatum, PlaybackUnitTime, PlaybackUnitInstance];

export interface PlaybackSpec {
  init_by?: typeof PlaybackTypes[number], // manual
  unit?: typeof PlaybackUnits[number], // 
  condition?: string, // condition on the current data points
  limit?: number,
  speed?: number,
  instrument?: string
}