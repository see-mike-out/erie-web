import { SamplingItem } from "../object";

export interface ToneSpec {
  type?: string,
  continued?: boolean,
  filter?: string[]
}

export interface SampledToneSpec {
  name: string;
  sample: SamplingItem;
}

export interface WaveSpec {
  name: string
  disableNormalization: boolean;
  real: number[];
  imag: number[];
}