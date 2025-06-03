import {
  sendSpeechFinishEvent,
  sendSpeechStartEvent
} from '../audio-graph-player-event';
import {
  emitNotePlayEvent,
  emitNoteStopEvent
} from "../audio-graph-note-event";
import { WebSpeechGenerator } from '../audio-graph-web-speech-generator';
import { GoogleCloudTTSGenerator } from '../audio-graph-google-tts-generator';
import {
  clearPlayerEvents,
  isErieGlobalState,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';
import {
  AudioGraphQueueItemText,
  ConfigInterface,
  SpeechType,
  Stopped,
} from '../../types';
import {
  genRid
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse';


export async function playSingleSpeech(
  sound: AudioGraphQueueItemText,
  config: ConfigInterface,
  bufferPrimitve: AudioPrimitiveBuffer | undefined,
  ttsFetchFunction: any
) {

  // if it is from a discrete series and being stopped, then do nothing
  if (config?.subpart && isErieGlobalState(Stopped)) return;

  // if it is an individual play (not from a discrete series)
  if (!config?.subpart) setErieGlobalState(undefined);

  let sid = genRid();
  if (!config.subpart) {
    sendSpeechStartEvent({ sound, sid });
  }

  let onstart = () => {
    emitNotePlayEvent(SpeechType, sound);
  }
  let onend = () => {
    clearPlayerEvents();
    setErieGlobalControl(undefined);
    setErieGlobalState(undefined);
    emitNoteStopEvent(SpeechType, sound);
    if (!config.subpart) {
      sendSpeechFinishEvent({ sid });
    }
  }

  if (typeof window !== 'undefined' && bufferPrimitve && typeof ttsFetchFunction === 'function') {
    let speechRendered = await ttsFetchFunction({ text: sound, config });
    let ctx = new AudioContext()
    bufferPrimitve.add('next', await ctx.decodeAudioData(speechRendered));
  } else if (typeof window === 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
    await GoogleCloudTTSGenerator(sound, config);
  } else {
    if (typeof window !== 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
      console.warn("Google Cloud TTS API can only be used on Node.js Server environment.")
    }
    return new Promise((resolve, reject) => {
      WebSpeechGenerator(sound, config, onstart, onend, resolve);
    });
  }
  return;
}
