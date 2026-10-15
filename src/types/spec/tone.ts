import { SamplingItem } from "../object";

export interface ToneSpec {
  type?: string,
  continued?: boolean,
  filter?: string[],
  hasBaseTone?: boolean
  sustain?: boolean,
  baseToneAsTick?: boolean | string,
  tickInterval?: number
}

export interface SampledToneSpec {
  name: string;
  sample: SamplingItem;
  baseUrl?: string;
}

export interface WaveSpec {
  name: string
  disableNormalization?: boolean;
  real: number[];
  imag: number[];
}