import { RecordObject } from "../generic";
import { bcp47language, SingleTapPosType } from "../object";
import { BeatObject } from "./time";

export type BasicToneGlyph = {
  start?: number | 'after_previous';
  end?: number;
  duration?: number;
  instrument_type?: string;
  pitch?: number;
  detune?: number;
  loudness?: number;
  pan?: number;
  postReverb?: number;
  timbre?: string;
  tapCount?: TapCountValue;
  tapSpeed?: TapSpeedValue;
  tap?: TapPattern;
  modulation?: number;
  harmonicity?: number;
  others?: RecordObject;
}

export type BasicSpeechGlyph = {
  duration?: number;
  speech?: string;
  speechRate?: number;
  language?: typeof bcp47language[number];
  pitch?: number;
  loudness?: number;
}

export type Glyph = BasicToneGlyph & BasicSpeechGlyph & {
  __datum?: RecordObject;
  [key: string]: any;
  // key?: string;
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

export type TapPattern = {
  pattern: number[],
  totalLength: number,
  patternString: string
};

export type PuaseMarker = {
  rate?: number,
  length?: number
};

export type TapCountValue = {
  value: number,
  tapLength: number,
  pause: PuaseMarker,
  beat: BeatObject
}

export type TapSpeedValue = {
  value: number,
  tapDuration: number,
  tappingUnit: number,
  singleTappingPosition: SingleTapPosType,
  beat: BeatObject
}

export type TapValue = {
  count: number, speed: number
} | number;