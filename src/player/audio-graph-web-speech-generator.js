import { Speech, bcp47language, setErieGlobalControl } from "./audio-graph-player-proto";

let ErieGlobalSynth;

export async function WebSpeechGenerator(sound, config, onstart, onend, resolve) {
  if (!ErieGlobalSynth) ErieGlobalSynth = window.speechSynthesis;
  var utterance = new SpeechSynthesisUtterance(sound.speech);
  if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
  else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
  if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
  if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
  if (sound?.language) utterance.lang = bcp47language.includes(sound.language) ? sound.language : document?.documentElement?.lang;
  else utterance.lang = document.documentElement.lang;
  onstart();
  ErieGlobalSynth.speak(utterance);
  setErieGlobalControl({ type: Speech, player: ErieGlobalSynth });
  utterance.onend = () => {
    onend();
    resolve();
  };
}