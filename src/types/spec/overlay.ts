import { ConfigSpec } from "./config"
import { TickSpec } from "./channel"
import { DatasetSpecItem, DataSpec } from "./data"
import { UnitStreamSpec } from "./unit-stream"
import { TransformListSpec } from "./transform"
import { SampledToneSpec, WaveSpec } from "./tone"
import { SynthSpec } from "./synth"

export type OverlayStreamSpec1 = {
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,
  name?: string,
  data: DataSpec,
  transform?: TransformListSpec,
  overlay: UnitStreamSpec[],
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[]
}

export type OverlayStreamSpec2 = {
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,
  name?: string,
  datasets: DatasetSpecItem[]
  transform?: TransformListSpec,
  overlay: UnitStreamSpec[],
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[]
}

export type OverlayStreamSpec = OverlayStreamSpec1 | OverlayStreamSpec2;

export type InSeqOverlayStreamSpec = {
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,
  name?: string,
  data?: DataSpec,
  datasets?: DatasetSpecItem[]
  transform?: TransformListSpec,
  overlay: UnitStreamSpec[]
}