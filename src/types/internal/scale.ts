import { aRange } from "../../util";
import { ABS, Condition, EncodingType, FormatType, NEG, POS, REL, ScaleTransformType, ScaleType, SIM, SortValues } from "../encoding";
import { OVERLAY, SEQUENCE } from "../stream";
import { Glyph, QueueItemTypes, TextType, ToneSeries } from "./stream";
import { BeatObject } from "./time";

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
  formatType?: 'number' | 'datetime' | 'time',
  binned?: boolean,
  playAllDescription?: boolean,
  conditions?: Condition,
  timing?: typeof ABS | typeof REL | typeof SIM,
  rangeProvided?: boolean,
  times?: number,
  polarity?: typeof POS | typeof NEG,
  sort?: SortValues,
  domainSpecified?: boolean | boolean[],
  scaleType?: ScaleTransformType,
  timeUnit?: keyof typeof timeUnitDomainDefs,
  timeUnitName?: string | string[] | number[],
  timeLevel?: timeLevelValues
};

export interface ParsedScaleFunction {
  properties: ParsedScaleProperties,
  scaleId?: string,
  description?: any,
  (...args: any[]): any
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

export type ScaleCollection = {
  __beat?: BeatObject
} & {
  [key: string]: ParsedScaleFunction
};

export type ParsedScaleDescription = {
  type: typeof TextType,
  channel: string,
  speech: string | undefined,
  speechRate: number
} | {
  type: typeof ToneSeries,
  channel: string,
  sounds: Glyph[],
  instrument_type: string,
  continued: boolean,
} | {
  type: typeof QueueItemTypes[number],
  channel: string,
  sound: Glyph,
  instrument_type: string
}

export const timeUnitDomainDefs = {
  monthNumber: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  monthNumber1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  monthShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthLong: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dayNumber: [0, 1, 2, 3, 4, 5, 6],
  dayNumber1: [1, 2, 3, 4, 5, 6, 7],
  dayNumberFromMon: [6, 0, 1, 2, 3, 4, 5],
  dayNumberFromMon1: [7, 1, 2, 3, 4, 5, 6],
  dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayShort: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
  date: aRange(0, 31, true),
  hour: aRange(0, 24, false),
  hour12: aRange(0, 12, false),
  minute: aRange(0, 60, false),
  second: aRange(0, 60, false),
  millisecond: aRange(0, 100, false)
}

export type timeLevelValues = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second' | 'millisecond';