import { ToneSpec, WaveSpec } from "./tone"
import { ChannelSpec, StreamingChannelSpec, TickSpec } from "./channel";
import { StreamingDataSpec } from "./data";
import { NotifySpec } from "./notify"
import { ConfigSpec } from "./config"
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
  wave?: WaveSpec[],
  config?: ConfigSpec,

  // Streaming Specific
  playback?: PlaybackSpec,
  notify?: NotifySpec
}

export const PlaybackManual = 'manual', PlaybackConditional = 'conditional', PlaybackAuto = 'auto';
export const PlaybackTypes = [PlaybackManual, PlaybackConditional, PlaybackAuto];

export const PlaybackUnitDatum = 'datum', PlaybackUnitTime = 'time', PlaybackUnitInstance = 'instance';
export const PlaybackUnits = [PlaybackUnitDatum, PlaybackUnitTime, PlaybackUnitInstance];

export interface PlaybackSpec {
  type: typeof PlaybackTypes[number],
  unit: typeof PlaybackUnits[number],
  condition: string,
  limit: number,
}
// conditional, manual, or automatic playback: define how much to go back (time or data)
// if conditional: should be provided
// manual
// automatic