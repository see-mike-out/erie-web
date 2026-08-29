import { Glyphs2 } from "../../compiled";
import { ConfigNormed } from "../../normalized";
import {
  RampType,
  ToneOverlaySeries,
  ToneSeries,
  ToneSpeechSeries
} from "../../object";

export type AudioGraphQueueItemSeries = {
  type: typeof ToneSeries | typeof ToneSpeechSeries;
  config?: ConfigNormed;
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
  config?: ConfigNormed;
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
  config?: ConfigNormed;
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
  config?: ConfigNormed;
  duration?: number;
  overlays: AudioGraphQueueItemToneSeries[]
}
