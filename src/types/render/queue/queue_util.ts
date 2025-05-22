import {
  Pause,
  TextType,
  ToneOverlaySeries,
  ToneSeries,
  ToneSpeechSeries,
  ToneType
} from "../../object";
import {
  AudioGraphQueueItem
} from "./queue";
import {
  AudioGraphQueueItemPause,
  AudioGraphQueueItemText,
  AudioGraphQueueItemTone
} from "./queue_atom";
import {
  AudioGraphQueueItemSeries,
  AudioGraphQueueItemToneOVerlaySeries,
  AudioGraphQueueItemToneSeries,
  AudioGraphQueueItemToneSpeechSeries
} from "./queue_series";

export function isTextQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemText & { group_id: number } {
  return item.type === TextType;
}

export function isToneQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemTone & { group_id: number } {
  return item.type === ToneType;
}

export function isPauseQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemPause & { group_id: number } {
  return item.type === Pause;
}

export function isSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemSeries & { group_id: number } {
  return item.type === ToneSeries || item.type === ToneSpeechSeries;
}

export function isToneSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneSeries & { group_id: number } {
  return item.type === ToneSeries;
}

export function isToneSpeechSeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneSpeechSeries & { group_id: number } {
  return item.type === ToneSpeechSeries;
}

export function isToneOverlaySeriesQueueItem(
  item: AudioGraphQueueItem
): item is AudioGraphQueueItemToneOVerlaySeries & { group_id: number } {
  return item.type === ToneOverlaySeries;
}
