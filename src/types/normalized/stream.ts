import { ConfigNormed } from "./config";
import {
  DataNormed,
  DatasetSpecItemNormed,
  TransformListNormed
} from "./data";
import { EncodingNormed } from "./encoding";
import { ParsedScaleDefinition } from "./scale";
import {
  SampledToneNormed,
  SynthNormed,
  TickNormed,
  ToneNormed,
  WaveNormed
} from "./tone";

export type NormalizedStream = {
  normalized: NormalizedStreamItem[],
  scaleDefinitions: ParsedScaleDefinition[],
  datasets: { [key: string]: DatasetSpecItemNormed },
  tick: { [key: string]: TickNormed },
  sequenceConfig: ConfigNormed,
  synths: SynthNormed[],
  samplings: SampledToneNormed[],
  waves: WaveNormed[]
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
  config: ConfigNormed
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
  data: DataNormed,
  tone: ToneNormed,
  filter?: string[],
  encoding: EncodingNormed,
  config?: ConfigNormed,
  transform?: TransformListNormed,
  common_transform?: TransformListNormed
}

// introduction stream
export type IntroStream = {
  title?: string | undefined;
  description?: string | undefined;
}