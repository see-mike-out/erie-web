import { HashedObject } from "../generic";
import {
  NotifySpec,
  PlaybackSpec
} from "../spec";
import { DatasetSpecItemNormed } from "./data";

export { ConfigSpec as ConfigNormed } from "../spec";

export type StreamingOptionNormed = {
  playback?: PlaybackSpec
  notify?: NotifySpec,
  test_data?: HashedObject<DatasetSpecItemNormed>,
  save_limit?: number
}