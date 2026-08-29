import {
  BasicSpeechGlyph,
  BasicToneGlyph
} from "../../compiled";
import { ConfigNormed } from "../../normalized";
import {
  Pause,
  QueueItemTypes,
  TextType
} from "../../object";

// to Play
export type AudioGraphQueueItem0 = {
  type: typeof QueueItemTypes[number];
  config?: ConfigNormed;
  duration?: number;
}

export type AudioGraphQueueItemText = {
  type: typeof TextType;
  config?: ConfigNormed;
} & BasicSpeechGlyph

export type AudioGraphQueueItemTone = {
  type: typeof TextType;
  config?: ConfigNormed;
  filters?: string[];
} & BasicToneGlyph


export type AudioGraphQueueItemPause = {
  type: typeof Pause;
  duration: number;
  config?: ConfigNormed;
}