import { ConfigInterface } from "../config";
import { RampType } from "../encoding";
import { RecordObject } from "../generic";
import {
  Glyph,
  Glyphs2,
  Pause,
  QueueItemTypes,
  TextType,
  ToneOverlaySeries,
  ToneSeries,
  ToneSpeechSeries,
  ToneType
} from "../internal";
import { TapPattern } from "./instrument";
import { TapCountValue, TapSpeedValue } from "./tapping";

// to Play
export type AudioGraphQueueItem0 = {
  type: typeof QueueItemTypes[number];
  config?: ConfigInterface;
  duration?: number;
}

export type AudioGraphQueueItemText = {
  type: typeof TextType;
  config?: ConfigInterface;
  duration?: number;
  text?: string;
  speechRate?: number;
}

export type AudioGraphQueueItemTone = {
  type: typeof ToneType;
  config?: ConfigInterface;
  instrument_type: string;
  duration?: number;
  time?: number;
  end?: number;
  pitch?: number;
  detune?: number;
  loudness?: number;
  pan?: number;
  postReverb?: number;
  timbre?: string;
  tapCount?: TapCountValue | undefined;
  tapSpeed?: TapSpeedValue | undefined;
  tap?: TapPattern | undefined;
  modulation?: number | undefined;
  harmonicity?: number | undefined;
  others?: RecordObject;
  filters?: string[];
}

export type AudioGraphQueueItemSeries = {
  type: typeof ToneSeries | typeof ToneSpeechSeries;
  config?: ConfigInterface;
  instrument_type: string;
  sounds: Glyphs2;
  continued: boolean;
  relative: boolean;
  filters: string[];
  ramp: { [key: string]: RampType | undefined };
  duration: number;
}

export type AudioGraphQueueItemToneSeries = {
  type: typeof ToneSeries;
  config?: ConfigInterface;
  instrument_type: string;
  sounds: Glyphs2;
  continued: boolean;
  relative: boolean;
  filters: string[];
  ramp: { [key: string]: RampType | undefined };
  duration: number;
}


export type AudioGraphQueueItemToneSpeechSeries = {
  type: typeof ToneSpeechSeries;
  config?: ConfigInterface;
  instrument_type: string;
  sounds: Glyphs2;
  continued: boolean;
  relative: boolean;
  filters: string[];
  ramp: { [key: string]: RampType | undefined };
  duration: number;
}

export type AudioGraphQueueItemToneOVerlaySeries = {
  type: typeof ToneOverlaySeries;
  config?: ConfigInterface;
  duration?: number;
  overlays: AudioGraphQueueItemToneSeries[]
}

export type AudioGraphQueueItemPause = {
  type: typeof Pause;
  duration: number;
}
export type AudioGraphQueueItem
  = AudioGraphQueueItem0
  | AudioGraphQueueItemText
  | AudioGraphQueueItemTone
  | AudioGraphQueueItemPause
  | AudioGraphQueueItemSeries
  | AudioGraphQueueItemToneSeries
  | AudioGraphQueueItemToneOVerlaySeries;

export function isTextQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemText {
  return item.type === TextType;
}

export function isToneQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemTone {
  return item.type === ToneType;
}

export function isPauseQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemPause {
  return item.type === Pause;
}

export function isSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemSeries {
  return item.type === ToneSeries || item.type === ToneSpeechSeries;
}

export function isToneSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneSeries {
  return item.type === ToneSeries;
}

export function isToneSpeechSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneSpeechSeries {
  return item.type === ToneSpeechSeries;
}

export function isToneOverlaySeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneOVerlaySeries {
  return item.type === ToneOverlaySeries;
}
