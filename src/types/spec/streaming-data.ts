import { ConfigInterface } from "../config"
import { TickObject } from "../encoding"
import { SampledToneObject } from "../sampling"
import { SynthObject } from "../synth"
import { ToneObject } from "../tone"
import { TransformList } from "../transform"
import { WaveObject } from "../wave"
import { SpecChannel } from "./channel"
import { StreamingDataSpec } from "./data"
import { DataChunkObject } from "../chunk"
import { PlaybackEvent } from "../playback"
import { ScaleCollection } from "../internal"
import { NotifyObject } from "../notify"

export type StreamingSpec = {
  // single stream?
  title?: string,
  description?: string,
  name?: string,
  data: StreamingDataSpec, // user provided test data spec, not required
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
  config?: ConfigInterface,


  // continuous: boolean,  -> in ToneObject
  summarization?: DataChunkObject,
  playback?: PlaybackEvent, 
  notify?: NotifyObject
}