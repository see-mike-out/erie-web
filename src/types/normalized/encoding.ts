import {
  AggOpType,
  Condition,
  EncodingType,
  FormatType,
  OVERLAY,
  RampType,
  ScaleType,
  SEQUENCE,
  SortValues,
  timeLevelValues,
  timeUnitDomainDefs,
  bcp47language
} from "../object";
import { InlineBinType } from "../spec"
import { TickNormed } from "./tone"

// encoding
export type EncodingNormed = {
  [key: string]: EncodingItemNormed
}

export type EncodingItemNormed = {
  field: string | string[],
  original_field?: string,
  type?: EncodingType,
  ramp?: RampType | undefined,
  aggregate?: AggOpType | undefined,
  bin?: InlineBinType | undefined,
  binned?: boolean,
  condition?: Condition | undefined,
  value?: any | undefined,
  scale?: ScaleType,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  speech?: boolean | undefined,
  tick?: TickNormed | undefined,
  roundToNote?: boolean,
  hasTapSpeed?: boolean | undefined,
  hasTapCount?: boolean | undefined,
  by?: typeof SEQUENCE | typeof OVERLAY | Array<typeof SEQUENCE | typeof OVERLAY> | undefined,
  sort?: SortValues,
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues,
  language?: typeof bcp47language[number],
  skipDescription?: boolean
}
