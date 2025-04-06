import { Glyph } from "../../compiled";
import { bcp47language, QueueItemTypes, RampType } from "../../object";

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