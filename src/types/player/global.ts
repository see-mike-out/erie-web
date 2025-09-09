import {
  SpeechType,
  ToneType,
  Stopped
} from "../object";

export type GlobalControlTone = {
  type: typeof ToneType,
  player: AudioContext | OfflineAudioContext,

};

export type GlobalControlSpeech = {
  type: typeof SpeechType,
  player: SpeechSynthesis,
};

export type GlobalControl = GlobalControlTone | GlobalControlSpeech;

export type GlobalStreamingControl = {
  streaming_base_tick_mute?: boolean
}

export type GlobalState = undefined | typeof Stopped | string;

export type SystemSpeechItem = { speech: string, speechRate?: number };