import { AudioPrimitiveBuffer } from '../../pulse';
import {
  ToneType,
  SpeechType,
  Stopped,
  ConfigInterface,
  Glyphs2,
  AudioGraphQueueItemText,
  Glyph
} from '../../types';
import {
  getEndTime1,
  getStartTime1,
  glyphSorterByEnd,
  glyphSorterByStart
} from '../../util';
import { makeInstrument } from '../audio-graph-make';
import {
  closeErieGlobalControl,
  isErieGlobalControlType,
  isErieGlobalState,
  setCurrentTime,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';
import { playSingleSpeech } from './audio-graph-player-single-speech';


export async function playAbsoluteSpeeches(
  ctx: AudioContext | OfflineAudioContext,
  queue: Glyphs2,
  config: ConfigInterface,
  ttsFetchFunction: any,
  bufferPrimitve?: AudioPrimitiveBuffer) {
  // clear previous state
  setErieGlobalState(undefined);

  // playing a series of discrete tones with an aboslute schedule
  // set audio context controls
  setErieGlobalControl({ type: ToneType, player: ctx });
  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.value = 0;

  // sort queue to mark the last node for sequence end check
  let q0: Glyph[] = queue.toSorted(glyphSorterByStart);
  q0[0].isFirst = true;
  let q: Glyph[] = q0.toSorted(glyphSorterByEnd);
  q[q.length - 1].isLast = true;

  config.subpart = true;
  // play as async promise
  return new Promise((resolve: Function, reject: Function) => {
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);

    // set and play sounds
    let prev;
    for (let sound of q) {
      if (isErieGlobalState(Stopped)) {
        resolve();
        break;
      }
      let d = 0;
      if (prev) {
        d = getStartTime1(q) - getEndTime1(prev);
      }
      // get discrete oscillator
      const inst = makeInstrument(ctx);
      inst.connect(gain);

      // play & stop
      inst.start(ct + sound.time - 0.02);
      inst.stop(ct + sound.time);

      // play the sound
      inst.onended = () => {
        if (config?.falseTiming && isErieGlobalControlType(SpeechType)) {
          closeErieGlobalControl()
        }
        playSingleSpeech(sound as AudioGraphQueueItemText, config, bufferPrimitve, ttsFetchFunction);
        if (sound.isLast) {
          resolve();
        }
      };
      prev = q;
    }
  });
}
