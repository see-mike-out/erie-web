import { ConfigSpec } from "./config"
import { ChannelSpec } from "./channel"

import { DataSpec } from "./data"
import { TransformListSpec } from "./transform"
import { ToneSpec } from "./tone"

export type UnitStreamSpec = {
  title?: string,
  description?: string,
  name?: string,
  data: DataSpec,
  transform?: TransformListSpec,
  tone: ToneSpec,
  // intentionally open definition because of custom channels
  encoding: {
    [key: string]: ChannelSpec
  },
  config?: ConfigSpec
}