// tone

export {
  SynthSpec as SynthNormed,
  WaveSpec as WaveNormed,
  SampledToneSpec as SampledToneNormed,
  TickSpec as TickNormed
} from "../spec"

export type ToneNormed = {
  type: string,
  filter?: string[],
  continued?: boolean
}

