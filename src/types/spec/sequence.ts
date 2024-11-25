import { ConfigInterface } from "../config"
import { TickObject } from "../encoding"
import { SampledToneObject } from "../sampling"
import { SynthObject } from "../synth"
import { TransformList } from "../transform"
import { WaveObject } from "../wave"
import { DatasetSpecItem, DataSpec } from "./data"
import { InSeqOverlayStreamSpec } from "./overlay"
import { UnitStreamSpec } from "./unit-stream"

export type SequenceStreamSpec1 = {
  title?: string,
  description?: string,
  name?: string,
  data: DataSpec,
  transform?: TransformList,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickObject[],
  sampling?: SampledToneObject[],
  synth?: SynthObject[],
  wave?: WaveObject[],
  config?: ConfigInterface
}

export type SequenceStreamSpec2 = {
  title?: string,
  description?: string,
  name?: string,
  datasets: DatasetSpecItem[]
  transform?: TransformList,
  sequence: Array<UnitStreamSpec | InSeqOverlayStreamSpec>,
  tick?: TickObject[],
  sampling?: SampledToneObject[],
  synth?: SynthObject[],
  wave?: WaveObject[],
  config?: ConfigInterface
}

export type SequenceStreamSpec = SequenceStreamSpec1 | SequenceStreamSpec2;