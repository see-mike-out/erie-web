import { ABS, Condition, EncodingType, REL, ScaleType, SIM } from "../encoding";
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
  descriptionDetail?: string,
  title?: string,
  format?: string,
  formatType?: 'number' | 'datetime' | 'time',
  binned?: boolean,
  playAllDescription?: boolean,
  conditions?: Condition,
  timing?: typeof ABS | typeof REL | typeof SIM
};

export interface ParsedScaleFunction {
  // [todo] make it precise
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
  isRepeated?: string[]
};

export type ScaleCollection = {
  __beat: BeatObject
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