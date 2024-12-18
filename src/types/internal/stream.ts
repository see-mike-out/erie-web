import { RecordObject } from "../generic";
import { bcp47language, TapCountValue, TapPattern, TapSpeedValue } from "../render";

export type Glyph = {
  start?: number;
  time?: number;
  end?: number;
  duration?: number;
  key?: string;
  instrument_type?: string;
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
  speech?: string;
  language?: typeof bcp47language[number];
  [key: string]: any,
  others?: RecordObject;
  __datum?: RecordObject;
};

export const DefaultGlyphFeatures = [
  'start', 'end', 'duration', 'instrument_type', 'pitch', 'detune', 'loudness', 'pan',
  'postReverb', 'timbre', 'tapCount', 'tapSpeed', 'tap', 'modulation', 'harmonicity', 'speech', 'language'
];

export type Glyphs2 = Glyph[] & {
  hasSpeech: boolean
}

export function isDefaultGlyphFeature(key: string) {
  return DefaultGlyphFeatures.includes(key);
}

export const TextType = 'text',
  ToneType = 'tone',
  SpeechType = 'speech',
  ToneSeries = 'tone-series',
  LegendType = 'legend',
  ToneSpeechSeries = 'tone-speech-series',
  Pause = 'pause',
  ToneOverlaySeries = 'tone-overlay-series';

export const QueueItemTypes = [
  TextType, ToneType, ToneSeries, LegendType, ToneSpeechSeries, Pause, ToneOverlaySeries
];