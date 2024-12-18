import {
  Speech,
  setErieGlobalControl
} from "./audio-graph-player-proto";

import {
  AudioGraphSpeechItem,
  bcp47language,
  ConfigInterface
} from "../types";

let ErieGlobalSynth: SpeechSynthesis;

export async function WebSpeechGenerator(
  sound: AudioGraphSpeechItem,
  config: ConfigInterface,
  onstart: Function,
  onend: Function,
  resolve: Function
): Promise<void> {
  if (!ErieGlobalSynth) ErieGlobalSynth = window.speechSynthesis;
  var utterance = new SpeechSynthesisUtterance(sound.speech);
  if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
  else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
  if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
  if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
  if (sound?.language) utterance.lang = (bcp47language.includes(sound.language) ? sound.language : (typeof document !== undefined ? document : {}).documentElement?.lang) as string;
  else utterance.lang = ((typeof document !== undefined ? document : {}).documentElement?.lang) as string;
  onstart();
  ErieGlobalSynth.speak(utterance);
  setErieGlobalControl({ type: Speech, player: ErieGlobalSynth });
  utterance.onend = () => {
    onend();
    if (resolve) resolve();
  };
}