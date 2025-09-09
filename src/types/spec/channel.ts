import {
  Condition,
  EncodingType,
  FormatType,
  RampType,
  ScaleType,
  SortValues,
  timeLevelValues,
  timeUnitDomainDefs,
  OscType,
  AggOpType
} from "../object";
import { InlineBinType } from "./transform";

export interface ChannelSpec {
  field?: string | string[] | undefined,
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
  tick?: TickSpec,
  roundToNote?: boolean,
  by?: string[] | string;
  p?: number | undefined;
  sort?: SortValues;
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues
}

export interface TickSpec {
  name?: string,
  interval?: number,
  band?: number,
  playAtTime0?: boolean,
  oscType?: OscType,
  sample?: string,
  instrument?: string,
  pitch?: number
  loudness?: number,
  description?: string
}

export interface StreamingChannelSpec {
  field?: string | string[] | undefined,
  type?: EncodingType | undefined,
  ramp?: RampType | undefined,
  aggregate?: AggOpType | undefined,
  bin?: InlineBinType | undefined,
  scale: ScaleType,
  condition?: Condition | undefined,
  value?: any | undefined,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  speech?: boolean | undefined,
  tick?: TickSpec,
  roundToNote?: boolean,
  by?: string[] | string;
  p?: number | undefined;
  sort?: SortValues;
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues,
  sustain?: boolean
}
