import {
  AggOpType,
  Condition,
  EncodingType,
  FormatType,
  RampType,
  ScaleType
} from "../object";
import { InlineBinType } from "../spec";
import { TickObject } from "./tick";

// Channel object
export interface ChannelObject {
  defined: boolean,
  channel: string | undefined,
  field?: string | undefined,
  type?: EncodingType | undefined,
  ramp?: RampType | undefined,
  aggregate?: AggOpType | undefined,
  bin?: InlineBinType | undefined,
  scale?: ScaleType,
  condition?: Condition | undefined,
  value?: any | undefined,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  speech?: boolean | undefined,
  tick?: TickObject | string,
  roundToNote?: boolean
}