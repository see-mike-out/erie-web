import { bcp47language } from "../object/speech";
import { Glyph } from "./glyph";

export type AudioGraph = Glyph[];

export type AudioGraphSpeechItem = {
  speech: string,
  speechRate?: number,
  language?: typeof bcp47language[number],
  pitch?: number,
  loudness?: number
};

export type AudioGraphSpeech = AudioGraphSpeechItem[];