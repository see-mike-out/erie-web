// scales after parsing
import { TransformerFunction } from "../compiled";
import {
  Condition,
  EncodingType,
  FormatType,
  PolarityType,
  ScaleTransformType,
  ScaleType,
  SortValues,
  timeLevelValues,
  timeUnitDomainDefs,
  TimingType,
  OVERLAY,
  SEQUENCE
} from "../object";

export type ParsedScaleProperties = {
  channel: string,
  encodingType: EncodingType,
  domain?: any[],
  range?: any[],
  length?: number,
  field?: string[],
  aggregate?: string,
  descriptionDetail?: string | null,
  title?: string,
  format?: string,
  formatType?: FormatType,
  binned?: boolean,
  playAllDescription?: boolean,
  conditions?: Condition,
  timing?: TimingType,
  rangeProvided?: boolean,
  times?: number,
  polarity?: PolarityType,
  sort?: SortValues,
  domainSpecified?: boolean | boolean[],
  scaleType?: ScaleTransformType,
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues
  index?: number;
};

export type ParsedScaleDefinition = {
  id: string,
  channel: string,
  type: EncodingType,
  dataName: string,
  field: string[],
  scale: ScaleType,
  streamID: string[],
  parentType: typeof SEQUENCE | typeof OVERLAY | null,
  parentId?: string,
  roundToNote?: boolean,
  hasTime2?: string[],
  isRepeated?: string[],
  collected?: string[],
  data?: any[],
  values?: any[] | undefined,
  value?: any | undefined,
  format?: string | undefined,
  formatType?: FormatType | undefined,
  condition?: Condition,
  sort?: SortValues,
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues
};
