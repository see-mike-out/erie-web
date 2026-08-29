import {
  ConfigInterface,
  SystemSpeechItem
} from "../types";

export async function playSystemSpeech(
  sound: SystemSpeechItem,
  config?: ConfigInterface) {
  return new Promise((resolve, reject) => {
    var synth = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance(sound.speech);
    if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
    else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
    synth.speak(utterance);
    utterance.onend = () => {
      resolve(0);
    };
  });
}
export async function notifyStop(config: ConfigInterface) {
  await playSystemSpeech({ speech: "Stopped.", speechRate: config?.speechRate })
  return;
}

export async function notifyPause(config: ConfigInterface) {
  await playSystemSpeech({ speech: "Paused.", speechRate: config?.speechRate });
  return;
}

export async function notifyResume(config: ConfigInterface) {
  await playSystemSpeech({ speech: "Resumeing", speechRate: config?.speechRate });
  return;
}