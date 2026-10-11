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
import { Notify } from "classes/erie-notify"

// data
export type SequenceStreamSpec1 = {
  name?: string,
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,

  data?: DataSpec,
  transform?: TransformListSpec,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[],
  config?: ConfigSpec
  notify?: { [key: string]: Notify }
}

// dataset
export type SequenceStreamSpec2 = {
  name?: string,
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,

  datasets: DatasetSpecItem[]
  transform?: TransformListSpec,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickSpec[],
  sampling?: SampledToneSpec[],
  synth?: SynthSpec[],
  wave?: WaveSpec[],
  config?: ConfigSpec,
  notify?: { [key: string]: Notify }
}

export type SequenceStreamSpec = SequenceStreamSpec1 | SequenceStreamSpec2;