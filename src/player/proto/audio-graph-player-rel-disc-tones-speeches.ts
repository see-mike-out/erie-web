import {
  sendSpeechFinishEvent,
  sendSpeechStartEvent,
  sendToneFinishEvent,
  sendToneStartEvent
} from '../audio-graph-player-event';

import {
  AudioGraphQueueItemText,
  ConfigInterface,
  Glyphs2,
  HashedSynthObject,
  HashedWaveObject,
  LoadedSampleCollection,
  Stopped,
} from '../../types';
import {
  deepcopy,
  genRid
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse';
import { isErieGlobalState, setErieGlobalState } from '../audio-graph-player-global';
import { playSingleSpeech } from './audio-graph-player-single-speech';
import { playSingleTone } from './audio-graph-player-single-tone';

export async function playRelativeDiscreteTonesAndSpeeches(
  ctx: AudioContext | OfflineAudioContext,
  queue: Glyphs2,
  _config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedSynthObject,
  waveDefs: HashedWaveObject,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined,
  ttsFetchFunction: any
) {
  // clear previous state
  setErieGlobalState(undefined);

  let config = deepcopy(_config);
  config.subpart = true;
  for (const sound of queue) {
    if (isErieGlobalState(Stopped)) break;
    let sid = genRid();
    if (sound.speech) {
      sendSpeechStartEvent({ sound, sid });
      await playSingleSpeech(sound as AudioGraphQueueItemText, config, bufferPrimitve, ttsFetchFunction);
      sendSpeechFinishEvent({ sid });
    } else {
      sendToneStartEvent({ sid });
      await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
      sendToneFinishEvent({ sid });
    }
  }
  setErieGlobalState(undefined);
  return;
}
