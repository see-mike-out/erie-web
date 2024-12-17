import { RecordObject } from "../generic";

export type Glyph = {
  start?: number,
  duration?: number,
  key?: string,
  [key: string]: any,
  others?: RecordObject;
};
export type QueueStream = {};


export const TextType = 'text',
  ToneType = 'tone',
  ToneSeries = 'tone-series',
  LegendType = 'legend',
  ToneSpeechSeries = 'tone-speech-series',
  Pause = 'pause',
  ToneOverlaySeries = 'tone-overlay-series';

export const QueueItemTypes = [
  TextType, ToneType, ToneSeries, LegendType, ToneSpeechSeries, Pause, ToneOverlaySeries
]
