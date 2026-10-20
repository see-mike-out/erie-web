import { setErieGlobalControl } from "./audio-graph-player-global";
import {
  AudioGraphQueueItemText,
  AudioGraphSpeechItem,
  bcp47language,
  ConfigInterface,
  SpeechType
} from "../types";


let ErieGlobalSynth: SpeechSynthesis;

export async function WebSpeechGenerator(
  player_id: string,
  sound: AudioGraphSpeechItem | AudioGraphQueueItemText,
  config: ConfigInterface,
  onstart: Function,
  onend: Function,
  resolve: Function
): Promise<void> {
  if (!ErieGlobalSynth) ErieGlobalSynth = window.speechSynthesis;
  var utterance = new SpeechSynthesisUtterance(sound.speech);
  if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate
  else if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
  if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
  if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
  if (sound?.language) utterance.lang = (bcp47language.includes(sound.language) ? sound.language : (typeof document !== undefined ? document : {}).documentElement?.lang) as string;
  else utterance.lang = ((typeof document !== "undefined" ? document : {}).documentElement?.lang) as string;
  onstart();
  utterance.onerror = () => {
    onend();
    if (resolve) resolve();
  };
  utterance.onend = () => {
    onend();
    if (resolve) resolve();
  };
  ErieGlobalSynth.speak(utterance);
  setErieGlobalControl(player_id, { type: SpeechType, player: ErieGlobalSynth });
}