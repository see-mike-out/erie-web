import { RampType } from "../encoding";
import { Glyph, QueueItemTypes, TextType } from "../internal"
import { bcp47language } from "./speech";

export type PreGraphSpeechItem = {
  speech: string,
  speechRate?: number,
  language?: typeof bcp47language[number],
  pitch?: number,
  loudness?: number
};
export type PreGraphSpeech = PreGraphSpeechItem[];

export type PreGraphUnit = {
  instrument_type: string,
  sounds: Glyph[],
  continued: boolean,
  relative: boolean,
  filters: string[],
  ramp: { [key: string]: RampType | undefined },
  duration: number
}

export type PreGraphOverlay = {
  duration?: number;
  overlays: PreGraphUnit[];
}

export type PreGraphSound = {
  instrument_type: string,
  duration: number,
  sound: Glyph;
  filters?: string[];
};

export type PreGraphPause = {
  duration: number;
}

export type PreGraphItem
  = PreGraphSpeechItem
  | PreGraphSound
  | PreGraphUnit
  | PreGraphOverlay
  | PreGraphPause;

export type CompressedPreGraphItem = PreGraphItem & {
  type: typeof QueueItemTypes[number]
}

export function isTextInfo(
  item: PreGraphItem
): item is PreGraphSpeechItem {
  return 'speech' in item;
}
export function isSoundInfo(
  item: PreGraphItem
): item is PreGraphSound {
  return 'instrument_type' in item;
}

export function isPauseInfo(
  item: PreGraphItem
): item is PreGraphPause {
  return 'duration' in item && Object.keys(item).length == 1;
}

export function isGlyphInfo(
  item: PreGraphItem
): item is PreGraphSound {
  return 'start' in item;
}

export function isToneSeriesInfo(
  item: PreGraphItem
): item is PreGraphUnit {
  return 'sounds' in item;
}

export function isToneOverlayInfo(
  item: PreGraphItem
): item is PreGraphOverlay {
  return 'overlays' in item;
}
