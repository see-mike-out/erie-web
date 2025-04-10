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
  stream: NormalizedSingleStream;
  name?: string;
  id: string;
}

export type NormalizedOverlayItem = {
  overlay: NormalizedSingleStream[],
  id: string,
  name?: string,
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean
}

export type NormalizedIntroStreamItem = {
  intro: IntroStream;
  id: string;
}

// single stream
export type NormalizedSingleStream = {
  title?: string,
  skipTitle?: boolean,
  name?: string,
  id: string,
  description?: string,
  skipDescription?: boolean,
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
  skipTitle?: boolean;
  skipDescription?: boolean;
  skipLength?: boolean;
  id: string;
}