import { ConfigInterface } from "../config"
import { ToneObject } from "../tone"
import { TransformList } from "../transform"
import { SpecChannel } from "./channel"
import { DataSpec } from "./data"

export type UnitStreamSpec = {
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
  config?: ConfigInterface
}