import {
  Datum,
  NotifySpec,
  PlaybackTypes,
  PlaybackUnits
} from "../spec"
import { LoadedDatasets } from "./data"


export interface PlaybackQuery {
  init_by?: typeof PlaybackTypes[number],
  unit?: typeof PlaybackUnits[number],
  condition?: ((d: Datum) => boolean) | null,
  limit?: number,
  speed?: number
}

export type StreamingOption = {
  playback?: PlaybackQuery
  notify?: NotifySpec,
  test_data?: LoadedDatasets,
  save_limit?: number
};

export type StreamingHistoryItem = {
  time: Date,
  data: Datum[]
}

export type StreamingRepeatObject = {
  field: string[];
  order: Array<any[]>;
  announce: boolean;
  checker: ((d: Datum, oi: number) => boolean);
}