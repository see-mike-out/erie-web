import { FormatType, ScaleType, Condition, EncodingType, RampType, TickObject, SortValues } from "../encoding";
import { timeLevelValues, timeUnitDomainDefs } from "../internal";
import { AggOpType, InlineBinType } from "../transform";

export interface SpecChannel {
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
  tick?: TickObject,
  roundToNote?: boolean,
  by?: string[] | string;
  p?: number | undefined;
  sort?: SortValues;
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues
}
