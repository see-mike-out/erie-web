import { ConfigInterface } from "../config"
import { TickObject } from "../encoding"
import { SampledToneObject } from "../sampling"
import { SynthObject } from "../synth"
import { TransformList } from "../transform"
import { WaveObject } from "../wave"
import { DatasetSpecItem, DataSpec } from "./data"
import { UnitStreamSpec } from "./unit-stream"

export type OverlayStreamSpec1 = {
  title?: string,
  description?: string,
  name?: string,
  data: DataSpec,
  transform?: TransformList,
  overlay: UnitStreamSpec[],
  tick?: TickObject[],
  sampling?: SampledToneObject[],
  synth?: SynthObject[],
  wave?: WaveObject[],
  config?: ConfigInterface
}

export type OverlayStreamSpec2 = {
  title?: string,
  description?: string,
  name?: string,
  datasets: DatasetSpecItem[]
  transform?: TransformList,
  overlay: UnitStreamSpec[],
  tick?: TickObject[],
  sampling?: SampledToneObject[],
  synth?: SynthObject[],
  wave?: WaveObject[],
  config?: ConfigInterface
}

export type OverlayStreamSpec = OverlayStreamSpec1 | OverlayStreamSpec2;

export type InSeqOverlayStreamSpec = {
  title?: string,
  description?: string,
  name?: string,
  data?: DataSpec,
  datasets?: DatasetSpecItem[]
  transform?: TransformList,
  overlay: UnitStreamSpec[],
  config?: ConfigInterface
}