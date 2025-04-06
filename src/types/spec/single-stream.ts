import { ChannelSpec, TickSpec } from "./channel";
import { ConfigSpec } from "./config";
import { DataSpec } from "./data";
import { SynthSpec } from "./synth";
import { SampledToneSpec, ToneSpec, WaveSpec } from "./tone";
import { TransformListSpec } from "./transform";

export type SingleStreamSpec = {
  title?: string,
  description?: string,
  name?: string,
  data: DataSpec,
  transform?: TransformListSpec,
  tone: ToneSpec,
  // intentionally open definition because of custom channels
  encoding: {
    [key: string]: ChannelSpec
  },
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[],
  config?: ConfigSpec
}

export type ExtendedSingleSpec = SingleStreamSpec & {
  common_transform: TransformListSpec
  transform: TransformListSpec
}