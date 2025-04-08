import { bcp47language, NotifyType } from "../object";

export type SpeechNotifyItemSpec = {
  speech: string;
  loudness?: number;
  pitch?: number;
  language?: typeof bcp47language[number];
  speechRate?: number;
}

export type SampledNotifyItemSpec = {
  sample: string;
  loudness?: number;
  detune?: number;
}

export type ChimeNotifyItemSpec = { // predefined chimes
  chime: string;
  loudness?: number;
}

export type NotifyItemSpec = SpeechNotifyItemSpec | SampledNotifyItemSpec | ChimeNotifyItemSpec | boolean;

export interface NotifySpec {
  // notify?
  [key: NotifyType]: NotifyItemSpec;
  // incoming?: NotifyItemSpec;
  // beforePlayback?: NotifyItemSpec;
  // afterPlayback?: NotifyItemSpec;
  // beforePlay?: NotifyItemSpec;
  // afterPlay?: NotifyItemSpec;
}
