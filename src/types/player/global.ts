import { SpeechType, ToneType } from "../internal";
import { Stopped } from "../render";

export type GlobalControlTone = {
  type: typeof ToneType,
  player: AudioContext | OfflineAudioContext
};

export type GlobalControlSpeech = {
  type: typeof SpeechType,
  player: SpeechSynthesis
};

export type GlobalControl = GlobalControlTone | GlobalControlSpeech;

export type GlobalState = undefined | typeof Stopped | string;
