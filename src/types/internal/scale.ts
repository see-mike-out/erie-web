import { Condition, EncodingType, ScaleType } from "../encoding";
import { OVERLAY, SEQUENCE } from "../stream";
export type ParsedScaleProperties = {
  channel: string,
  encodingType: EncodingType,
  domain?: any[],
  range?: any[],
  length?: number,
  field?: string[],
  aggregate?: string,
  descriptionDetail?: string,
  title?: string,
  format?: string,
  formatType?: 'number' | 'datetime' | 'time',
  binned?: boolean,
  playAllDescription?: boolean,
  conditions?: Condition
};

export interface ParsedScaleFunction {
  // [todo] make it precise
  properties: ParsedScaleProperties,
  scaleId?: string
}

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
  isRepeated?: string[]
};
