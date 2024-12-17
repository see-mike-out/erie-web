import { RampType } from "../encoding";
import { Glyph, TextType } from "../internal"

export type PreGraphSpeechItem = {
  type: typeof TextType,
  speech: string,
  speechRate?: number
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