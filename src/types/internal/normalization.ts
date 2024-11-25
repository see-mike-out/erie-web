import { ConfigInterface } from "../config"
import { Condition, EncodingType, FormatType, RampType, ScaleType, TickObject } from "../encoding"
import { SampledToneObject } from "../sampling"
import { DatasetSpecItem, DataSpec3, SingleStreamSpec } from "../spec"
import { SynthObject } from "../synth"
import { AggOpType, InlineBinType, TransformList } from "../transform"
import { WaveObject } from "../wave"
import { ParsedDatasetObject } from "./data"
import { ParsedScaleDefinition } from "./scale"

export type NormalizedStream = {
  normalized: NormalizedStreamItem[],
  scaleDefinitions: ParsedScaleDefinition[],
  datasets: { [key: string]: ParsedDatasetObject },
  tick: { [key: string]: TickObject },
  sequenceConfig: ConfigInterface,
  synths: SynthObject[],
  samplings: SampledToneObject[],
  waves: WaveObject[]
}

export type NormalizedStreamItem = NormalizedSingleStreamItem
  | NormalizedOverlayItem
  | NormalizedIntroStreamItem;

export type NormalizedSingleStreamItem = {
  stream: NormalizedSingleStream
}

export type NormalizedOverlayItem = {
  overlay: NormalizedSingleStream[],
  id?: string,
  name?: string,
  title?: string,
  description?: string,
  config: ConfigInterface
}

export type NormalizedIntroStreamItem = {
  intro: IntroStream
}
// single stream
export type NormalizedSingleStream = {
  title?: string,
  name?: string,
  id: string,
  description?: string,
  data: DataSpec3,
  tone: NormalizedTone,
  filter?: string[],
  encoding: NormalizedEncoding,
  config?: ConfigInterface,
  transform?: TransformList,
  common_transform?: TransformList
}

// tone
export type NormalizedTone = {
  type: string,
  filter?: string[],
  continued?: boolean
}

// encoding
export type NormalizedEncoding = {
  [key: string]: NormalizedEncodingItem
}
export type NormalizedEncodingItem = {
  field: string | undefined,
  original_field?: string | undefined,
  type?: EncodingType | undefined,
  ramp?: RampType | undefined,
  aggregate?: AggOpType | undefined,
  bin?: InlineBinType | undefined,
  binned?: boolean,
  condition?: Condition | undefined,
  value?: any | undefined,
  scale?: ScaleType,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  speech?: boolean | undefined,
  tick?: TickObject | undefined,
  roundToNote?: boolean,
  hasTapSpeed?: boolean | undefined,
  hasTapCount?: boolean | undefined,
  by?: string[] | undefined
}

export type ExtendedSingleSpec = SingleStreamSpec & {
  common_transform: TransformList
  transform: TransformList
}

// introduction stream
export type IntroStream = {
  title?: string | undefined;
  description?: string | undefined;
}