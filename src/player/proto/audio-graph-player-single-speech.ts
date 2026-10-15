import {
  sendSpeechFinishEvent,
  sendSpeechStartEvent
} from '../audio-graph-player-event';
import {
  emitNotePlayEvent,
  emitNoteStopEvent
} from "../audio-graph-note-event";
import { WebSpeechGenerator } from '../audio-graph-web-speech-generator';
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
  player_id: string,
  sound: AudioGraphQueueItemText,
  config: ConfigInterface,
  bufferPrimitve: AudioPrimitiveBuffer | undefined,
  ttsFetchFunction: any
) {

  // if it is from a discrete series and being stopped, then do nothing
  if (config?.subpart && isErieGlobalState(player_id, Stopped)) return;

  // if it is an individual play (not from a discrete series)
  if (!config?.subpart) setErieGlobalState(player_id, undefined);

  let sid = genRid();
  if (!config.subpart) {
    sendSpeechStartEvent({ sound, sid });
  }

  let onstart = () => {
    emitNotePlayEvent(SpeechType, sound);
  }
  let onend = () => {
    clearPlayerEvents(player_id);
    setErieGlobalControl(player_id, undefined);
    setErieGlobalState(player_id, undefined);
    emitNoteStopEvent(SpeechType, sound);
    if (!config.subpart) {
      sendSpeechFinishEvent({ sid });
    }
  }

  if (typeof window !== 'undefined' && bufferPrimitve && typeof ttsFetchFunction === 'function') {
    let speechRendered = await ttsFetchFunction({ text: sound, config });
    let ctx = new AudioContext()
    bufferPrimitve.add('next', await ctx.decodeAudioData(speechRendered));
    ctx.close();
  } 
  // else if (typeof window === 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
  //   await GoogleCloudTTSGenerator(sound, config);
  // } 
  else {
    if (typeof window !== 'undefined' && config.speechGenerator === "GoogleCloudTTS") {
      console.warn("Google Cloud TTS API can only be used on Node.js Server environment.")
    }
    return new Promise((resolve, reject) => {
      WebSpeechGenerator(player_id, sound, config, onstart, onend, resolve);
    });
  }
  return;
}
