import {
  bcp47language,
  NotifyType
} from "../object";

export type SpeechNotifyItemSpec = {
  speech: string;
  loudness?: number;
  pitch?: number;
  language?: typeof bcp47language[number];
  speechRate?: number;
  pause?: number;
}

export type SampledNotifyItemSpec = {
  sample: string;
  loudness?: number;
  detune?: number;
  pause?: number;
}

export type ChimeNotifyItemSpec = { // predefined chimes
  chime: string;
  loudness?: number;
  pause?: number;
}

export type NotifyItemSpec = SpeechNotifyItemSpec | SampledNotifyItemSpec | ChimeNotifyItemSpec | boolean;

export interface NotifySpec {
  [key: NotifyType]: NotifyItemSpec;
}
