import { ConfigInterface } from "../config"
import { TickObject } from "../encoding"
import { SampledToneObject } from "../sampling"
import { SynthObject } from "../synth"
import { ToneObject } from "../tone"
import { TransformList } from "../transform"
import { WaveObject } from "../wave"
import { SpecChannel } from "./channel"
import { DataSpec } from "./data"

export type SingleStreamSpec = {
  title?: string,
  description?: string,
  name?: string,
  data: DataSpec,
  transform?: TransformList,
  tone: ToneObject,
  // intentionally open definition because of custom channels
  encoding: {
    [key: string]: SpecChannel
  },
  tick?: TickObject[],
  sampling?: SampledToneObject[],
  synth?: SynthObject[],
  wave?: WaveObject[],
  config?: ConfigInterface
}