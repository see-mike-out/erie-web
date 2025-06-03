import { ParsedScaleProperties } from "../normalized";
import {
  QueueItemTypes,
  TextType,
  ToneSeries
} from "../object";
import { Glyph } from "./glyph";
import { BeatObject } from "./time";

export interface ParsedScaleFunction {
  properties: ParsedScaleProperties,
  scaleId?: string,
  description?: any,
  (...args: any[]): any
}

export type ScaleCollection = {
  __beat?: BeatObject
} & {
  [key: string]: ParsedScaleFunction
};

export type ParsedScaleDescription = {
  type: typeof TextType,
  speech: string | undefined,
  speechRate: number
} | {
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
};
