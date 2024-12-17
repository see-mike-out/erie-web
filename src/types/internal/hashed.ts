import { SampledToneObject } from "../sampling";
import { SynthObject } from "../synth";
import { WaveObject } from "../wave"

export type HashedWaveObject = {
  [key: string]: WaveObject;
}

export type HashedSynthObject = {
  [key: string]: SynthObject;
}

export type HashedSampledToneObject = {
  [key: string]: SampledToneObject
}