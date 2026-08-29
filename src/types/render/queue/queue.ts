import {
  AudioGraphQueueItem0,
  AudioGraphQueueItemPause,
  AudioGraphQueueItemText,
  AudioGraphQueueItemTone
} from "./queue_atom";
import {
  AudioGraphQueueItemSeries,
  AudioGraphQueueItemToneOVerlaySeries,
  AudioGraphQueueItemToneSeries
} from "./queue_series";

export type AudioGraphQueueItem
  = (AudioGraphQueueItem0
    | AudioGraphQueueItemText
    | AudioGraphQueueItemTone
    | AudioGraphQueueItemPause
    | AudioGraphQueueItemSeries
    | AudioGraphQueueItemToneSeries
    | AudioGraphQueueItemToneOVerlaySeries) & { group_id: number };
