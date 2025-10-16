import { ErieSynth } from '../audio-graph-synth';
import { PresetFilters } from '../audio-graph-audio-filter';
import {
  sendToneFinishEvent,
  sendToneStartEvent
} from '../audio-graph-player-event';
import {
  emitNotePlayEvent,
  emitNoteStopEvent
} from "../audio-graph-note-event";
import {
  makeOfflineContext,
  makeInstrument
} from '../audio-graph-make';
import {
  isErieGlobalState,
  setCurrentTime,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';
import {
  createPanner
} from "../audio-graph-panner"

import { playPause } from './audio-graph-player-pause';
import { ErieFilters } from '../../classes';
import {
  ToneType,
  DefaultFrequency,
  Stopped,
  AM,
  FM,
  ConfigInterface,
  LoadedSampleCollection,
  Glyph,
  AudioFilterEncoder,
  AudioFilterFinisher,
  HashedObject,
  SynthNormed,
  WaveNormed,
  AudioFilterPrototype,
} from '../../types';
import {
  deepcopy,
  genRid,
  getDuration1
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse';
import { rampBy } from '../audio-graph-ramp';

export async function playSingleTone(
  ctx: AudioContext | OfflineAudioContext,
  sound: Glyph,
  config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedObject<SynthNormed>,
  waveDefs: HashedObject<WaveNormed>,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  // if it is from a discrete series and being stopped, then do nothing
  if (config?.subpart && isErieGlobalState(Stopped)) return;

  // if it is an individual play (not from a discrete series)
  if (!config?.subpart) setErieGlobalState(undefined);

  // clear previous state
  setErieGlobalState(undefined);

  // set audio context controls
  setErieGlobalControl({ type: ToneType, player: ctx });

  let sid;
  // if it is an individual play (not from a discrete series), fire a new tone start event
  if (!config.subpart) {
    sid = genRid()
    sendToneStartEvent({ sid });
  }

  if (sound.tap !== undefined && sound.tap?.pattern?.constructor.name === "Array") {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    let tapSound = deepcopy(sound);
    let t = 1, acc = 0, i = 0; // d
    if (sound.tap.pattern.length == 0) {
      await playPause((sound.duration || 0.2) * 1000);

      sendToneFinishEvent({ sid });
    }

    emitNotePlayEvent('tone', sound);
    for (const s of sound.tap.pattern) {
      if (t === 1) {
        tapSound.duration = s;
        if (s > 0) {
          await __playSingleTone(ctx, ct + acc, tapSound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
        }
        t = 0;
      } else {
        await playPause(s * 1000);
        t = 1;
      }
      acc += s;
      i++;
      if (i == sound.tap.pattern.length) {
        if (!config.subpart) {

          sendToneFinishEvent({ sid });
        }
      }
    }
    emitNoteStopEvent('tone', sound);
    return;
  } else {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    emitNotePlayEvent('tone', sound);
    await __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters, bufferPrimitve);
    emitNoteStopEvent('tone', sound);
    if (!config.subpart) {
      sendToneFinishEvent({ sid });
    }
    return;
  }
}


async function __playSingleTone(
  _ctx: AudioContext | OfflineAudioContext,
  ct: number,
  sound: Glyph,
  config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedObject<SynthNormed>,
  waveDefs: HashedObject<WaveNormed>,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  // treat dynamic duration (this is a really special case; for chime only)
  if (config.dynamic_duration && sound.instrument_type && sound.instrument_type in instSamples) {
    if ('mono' in instSamples[sound.instrument_type]) {
      // @ts-ignore
      let sample = instSamples[sound.instrument_type].mono as AudioBuffer;
      sound.duration = sample.duration;
    }
  }
  // filters
  let ctx: AudioContext | OfflineAudioContext = _ctx, offline = false;
  if (bufferPrimitve?.constructor?.name === AudioPrimitiveBuffer.name) {
    offline = true;
    ctx = makeOfflineContext(sound.duration ?? 0);
    ct = 0;
  }
  let filterEncoders: { [key: string]: AudioFilterEncoder } = {},
    filterFinishers: { [key: string]: AudioFilterFinisher } = {},
    filterNodes: { [key: string]: AudioFilterPrototype } = {};

  for (const filterName of filters) {
    if (PresetFilters[filterName]) {
      filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
      filterEncoders[filterName] = PresetFilters[filterName].encoder;
      filterFinishers[filterName] = PresetFilters[filterName].finisher
    } else if (ErieFilters[filterName]) {
      filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
      filterEncoders[filterName] = ErieFilters[filterName].encoder;
      filterFinishers[filterName] = ErieFilters[filterName].finisher
    }
  }

  let destination = ctx.destination as AudioNode;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ct, sound.duration);
      destination = filter.destination;
    }
  }
  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);

  // DONE  function to handle this and call as needed (look at ramp)
  const cartesianInputs = ['panX', 'panY', 'panZ'].filter(key => sound[key] !== undefined).length;
  const isStereo = cartesianInputs === 1 && sound.panX !== undefined;
  const panner = createPanner(ctx as any, cartesianInputs);
  panner.connect(gain);


  // play as async promise
  // get the current time
  // get discrete oscillator
  let iType = sound.timbre || config?.instrument_type
  const inst = makeInstrument(ctx, iType, instSamples, synthDefs, waveDefs, sound);

  inst.connect(panner);

  // set auditory values
  if (inst instanceof OscillatorNode) {
    rampBy('setValueAtTime', inst.frequency, sound.pitch ?? DefaultFrequency, ct);
  } else if (inst instanceof ErieSynth) {
    rampBy('setValueAtTime', inst.frequency, sound.pitch ?? inst.carrierPitch ?? DefaultFrequency, ct);
    if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
      rampBy('setValueAtTime', inst.modulator.frequency, (inst.modulatorVolume / sound.modulation), ct);
    } else if (inst.type === AM && sound.modulation !== undefined && sound.modulation > 0) {
      rampBy('setValueAtTime', inst.modulatorGain.gain, (sound.loudness || 1) * sound.modulation, ct);
    }
    if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
      inst.modulator.frequency.cancelScheduledValues(ct);
      rampBy('setValueAtTime', inst.modulator.frequency, (sound.pitch ?? inst.carrierPitch ?? DefaultFrequency) * sound.harmonicity, ct);
    } else if (sound.harmonicity === undefined) {
      inst.modulator.frequency.cancelScheduledValues(ct);
      rampBy('setValueAtTime', inst.modulator.frequency, sound.pitch, ct);
    }

    inst.envelope.gain.cancelScheduledValues(ct);
    rampBy('setValueAtTime', inst.envelope.gain, 0, ct);
    rampBy('linearRampToValueAtTime', inst.envelope.gain, 1, ct + (inst.attackTime || 0));
    if (inst.decayTime) {
      // rampBy('linearRampToValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + getStartTime1(sound) + inst.adTime);
      rampBy('linearRampToValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + inst.adTime);
    }
    rampBy('setValueAtTime', inst.envelope.gain, inst.sustain || 1, ct + (sound.duration ?? 0));
    rampBy('linearRampToValueAtTime', inst.envelope.gain, 0, ct + (sound.duration ?? 0) + inst.adTime);
  }

  if (sound.detune && 'detune' in inst && inst.detune) {
    rampBy('setValueAtTime', inst.detune, sound.detune ?? 0, ct);
  }

  if (sound.loudness !== undefined) {
    rampBy('setValueAtTime', gain.gain, sound.loudness ?? 1, ct);
  }
  if (sound.postReverb) {
    rampBy('setTargetAtTime', gain.gain, 0, ct + (sound.duration ?? 0) * 0.95, 0.015);
    rampBy('setTargetAtTime', gain.gain, 0.45, ct + (sound.duration ?? 0), 0.015);
    rampBy('exponentialRampToValueAtTime', gain.gain, 0.02, ct + (getDuration1(sound)) * 0.95);
  } else {
    sound.postReverb = 0;
  }

  let et = ct + (sound.duration ?? 0) + (sound.postReverb ?? 0);
  if (inst instanceof ErieSynth) {
    et += (inst.attackTime ?? 0) + (inst.releaseTime ?? 0);
  }

  for (const filterName of filters) {
    let encoder = filterEncoders[filterName];
    let finisher = filterFinishers[filterName];
    if (encoder) {
      encoder(filterNodes[filterName], sound, ct);
    }
    if (finisher) {
      // finisher(filterNodes[filterName], sound, ct + getStartTime1(sound), et);
      finisher(filterNodes[filterName], sound, ct, et);
    }
  }

  rampBy('setTargetAtTime', gain.gain, 0, ct + (et - ct) * 0.95, 0.05);

  if (isStereo && sound.panX !== undefined && panner instanceof StereoPannerNode) {
    panner.pan.setValueAtTime(sound.panX, ct);
  } else if (!isStereo && panner instanceof PannerNode) {
    if (sound.panX !== undefined) panner.positionX.setValueAtTime(sound.panX, ct);
    if (sound.panY !== undefined) panner.positionY.setValueAtTime(sound.panY, ct);
    if (sound.panZ !== undefined) panner.positionZ.setValueAtTime(sound.panZ, ct);
  }


  // play & stop
  if (offline && bufferPrimitve && ctx instanceof OfflineAudioContext) {
    inst.start(0);
    inst.stop(getDuration1(sound));
    let rb = await ctx.startRendering();
    if (sound.start !== 'after_previous') bufferPrimitve.add(sound.start ?? 0, rb);
    else bufferPrimitve.add('next', rb);
  } else {
    return new Promise((resolve: Function, reject: Function) => {
      inst.onended = (_) => {
        resolve();
      };
      inst.start(ct);
      inst.stop(ct + getDuration1(sound));
    });
  }
  return;
}
