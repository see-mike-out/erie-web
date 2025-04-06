import { sendToneFinishEvent, sendToneStartEvent } from '../audio-graph-player-event';
import { makeInstrument } from '../audio-graph-make';
import {
  isErieGlobalControlType,
  isErieGlobalState,
  setCurrentTime,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';

import { playSingleTone } from './audio-graph-player-single-tone';

import {
  ToneType,
  SpeechType,
  Stopped,
  ConfigInterface,
  LoadedSampleCollection,
  Glyph,
  Glyphs2,
  GlobalControlSpeech,
  HashedObject,
  SynthNormed,
  WaveNormed
} from '../../types';
import {
  playTick
} from '../../tick';
import {
  genRid,
  getEndTime1,
  glyphSorterByEnd,
  glyphSorterByStart
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse';

export async function playAbsoluteDiscreteTones(
  ctx: AudioContext,
  queue: Glyphs2,
  config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedObject<SynthNormed>,
  waveDefs: HashedObject<WaveNormed>,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  // clear previous state
  setErieGlobalState(undefined);

  // playing a series of discrete tones with an aboslute schedule
  // set audio context controls
  setErieGlobalControl({ type: ToneType, player: ctx });

  // sort queue to mark the last node for sequence end check
  let q0: Glyph[] = queue.toSorted(glyphSorterByStart);
  q0[0].isFirst = true;
  let q: Glyph[] = q0.toSorted(glyphSorterByEnd);
  q[q.length - 1].isLast = true;

  config.subpart = true;
  let endTime = getEndTime1(q[q.length - 1]);
  // play as async promise
  let sid = genRid();
  sendToneStartEvent({ sid });

  // gain == loudness
  // for timing
  // let timingCtx = bufferPrimitve ? makeOfflineContext(endTime) : new AudioContext();
  let timingCtx = new AudioContext();
  const gain = timingCtx.createGain();
  gain.connect(timingCtx.destination);
  gain.gain.value = 0;

  return new Promise(async (resolve: Function, reject: Function) => {
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    // set and play sounds
    for (let sound of q) {
      if (isErieGlobalState(Stopped)) {
        // resolve();
        break;
      }
      // get discrete oscillator
      const inst = makeInstrument(timingCtx);
      inst.connect(gain);

      // play & stop
      inst.start(ct + sound.start);
      inst.stop(ct + sound.start + 0.01);

      inst.onended = async () => {
        if (config?.falseTiming && isErieGlobalControlType(SpeechType)) {
          (window.ErieGlobalControl as GlobalControlSpeech)?.player?.cancel();
        }
        await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
        if (sound.isLast) {
          sendToneFinishEvent({ sid });
          resolve();
        }
      };
    }
    if (config.tick) {
      playTick(ctx, config.tick, endTime, ct + 0.01, ct + endTime + 0.01, bufferPrimitve);
    }
  });
}