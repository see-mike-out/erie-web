import { Datum, NotifySpec, PlaybackSpec, PlaybackTypes, PlaybackUnits } from "../spec"
import { LoadedDatasets } from "./data"


export interface PlaybackQuery {
  type?: typeof PlaybackTypes[number],
  unit?: typeof PlaybackUnits[number],
  condition?: ((d: Datum) => boolean) | null,
  limit?: number,
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