import { ConfigSpec } from "./config"
import { TickSpec } from "./channel"
import {
  DatasetSpecItem,
  DataSpec
} from "./data"
import { InSeqOverlayStreamSpec } from "./overlay"
import { UnitStreamSpec } from "./unit-stream"
import {
  SampledToneSpec,
  WaveSpec
} from "./tone"
import { TransformListSpec } from "./transform"
import { SynthSpec } from "./synth"

// data
export type SequenceStreamSpec1 = {
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,
  name?: string,
  data: DataSpec,
  transform?: TransformListSpec,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[],
  config?: ConfigSpec
}

// dataset
export type SequenceStreamSpec2 = {
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,
  name?: string,
  datasets: DatasetSpecItem[]
  transform?: TransformListSpec,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[],
  config?: ConfigSpec
}

export type SequenceStreamSpec = SequenceStreamSpec1 | SequenceStreamSpec2;