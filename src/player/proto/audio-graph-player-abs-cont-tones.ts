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
  setCurrentTime,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';
import { rampBy } from '../audio-graph-ramp';

import { ErieFilters } from '../../classes';
import {
  TAPSPD_chn,
  TAPCNT_chn,
  ToneType,
  DefaultFrequency,
  AM,
  FM,
  ConfigInterface,
  LoadedSampleCollection,
  HashedSynthObject,
  HashedWaveObject,
  Glyph,
  Glyphs2,
  AudioFilterFinisher,
  AudioFilterEncoder,
  RamperCollection,
  RamperNames
} from '../../types';
import {
  makeTick,
} from '../../tick';
import {
  genRid,
  getEndTime1,
  getStartTime1,
  glyphSorterByEnd,
  glyphSorterByStart
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse';
import { AudioFilterPrototype } from '../../audioFilters';


export async function playAbsoluteContinuousTones(
  _ctx: AudioContext,
  queue: Glyphs2,
  config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedSynthObject,
  waveDefs: HashedWaveObject,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  // clear previous state
  setErieGlobalState(undefined);

  // sort queue to mark the first and last node for sequence end check
  let q0: Glyph[] = queue.toSorted(glyphSorterByStart);
  q0[0].isFirst = true;
  let q: Glyph[] = q0.toSorted(glyphSorterByEnd);
  q[q.length - 1].isLast = true;

  // get the last tone's finish time
  let endTime = getEndTime1(q[q.length - 1]);

  // get the context
  let ctx: AudioContext | OfflineAudioContext = _ctx, offline = false;
  if (bufferPrimitve?.constructor?.name === AudioPrimitiveBuffer.name) {
    offline = true;
    ctx = makeOfflineContext(endTime);
    bufferPrimitve.length = endTime;
  }

  // set audio context controls
  setErieGlobalControl({ type: ToneType, player: ctx });

  // rampers 
  let rampers: RamperCollection = {};
  if (config.ramp) {
    Object.keys(config.ramp || {}).forEach((chn) => {
      let name = config.ramp[chn] in RamperNames ? RamperNames[config.ramp[chn] as keyof typeof RamperNames] : undefined;
      if (chn === TAPCNT_chn || chn === TAPSPD_chn) {
        rampers.tap = name;
      } else {
        rampers[chn] = name;
      }
    });
  }

  // filters
  let filterEncoders: { [key: string]: AudioFilterEncoder } = {},
    filterFinishers: { [key: string]: AudioFilterFinisher } = {},
    filterNodes: { [key: string]: AudioFilterPrototype } = {};
  for (const filterName of filters) {
    if (filterName in PresetFilters && PresetFilters[filterName]) {
      filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
      filterEncoders[filterName] = PresetFilters[filterName].encoder;
      filterFinishers[filterName] = PresetFilters[filterName].finisher;
    } else if ('filterName' in ErieFilters[filterName]) {
      filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
      filterEncoders[filterName] = ErieFilters[filterName].encoder;
      filterFinishers[filterName] = ErieFilters[filterName].finisher;
    }
  }
  let destination: AudioNode = ctx.destination;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ctx.currentTime, endTime);
      destination = filter.destination;
    }
  }

  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);
  
  // decide between stereo or 3d pan
  const cartesianInputs = ['panX', 'panY', 'panZ'].filter(key => queue[0][key] !== undefined).length;
  let panner!: AudioNode;

  if (cartesianInputs == 1) {
    const stereoPanner = ctx.createStereoPanner();
    stereoPanner.connect(gain);
    panner = stereoPanner;
  } else {
    const panner3D = ctx.createPanner();
    panner3D.connect(gain);
    panner3D.panningModel = 'HRTF';
    panner3D.distanceModel = 'inverse';
    panner3D.refDistance = 1;
    panner3D.maxDistance = 10000;
    panner3D.rolloffFactor = 1;
    panner3D.coneInnerAngle = 360;
    panner3D.coneOuterAngle = 0;
    panner3D.coneOuterGain = 0;
    panner = panner3D;
  }

  let sid = genRid()
  sendToneStartEvent({ sid });

  // play as async promise
  // get instrument
  const inst = makeInstrument(ctx, config?.instrument_type, instSamples, synthDefs, waveDefs, q[0], endTime);
  inst.connect(panner);
  let startTime!: number;
  // get the current time
  let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
  for (let sound of q) {
    let st = ct + getStartTime1(sound), base_et = ct + getEndTime1(sound);
    // sampled tone pitch is already set when the instrument was created + they can't compose a continuous tone.
    if (inst instanceof OscillatorNode) {
      // osc pitch
      rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pitch, inst.frequency, sound.pitch ?? DefaultFrequency, st);
    } else if (inst instanceof ErieSynth) {
      // synth pitch
      rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pitch, inst.frequency, sound.pitch ?? DefaultFrequency, st);
      // modulation
      if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.modulation, inst.modulator.frequency, (inst.modulatorVolume / sound.modulation), st);
      } else if (inst.type === AM && sound.modulation !== undefined) {
        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.modulation, inst.modulatorGain.gain, (sound.loudness ?? 1) * sound.modulation, st);
      }
      // hamonicity
      if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
        rampBy(sound.isFirst ? 'setValueAtTime' : rampers.harmonicity, inst.modulator.frequency, (sound.pitch ?? inst.carrierPitch ?? DefaultFrequency) * sound.harmonicity, st);
      }
      // initialize the envelope
      inst.envelope.gain.cancelScheduledValues(st);
      // before attack
      rampBy('setValueAtTime', inst.envelope.gain, 0, st)
      // attack + sustain
      rampBy('linearRampToValueAtTime', inst.envelope.gain, 1, st + (inst.attackTime ?? 0))
      if (inst.decayTime) {
        // sustain + decay
        rampBy('linearRampToValueAtTime', inst.envelope.gain, inst.sustain ?? 1, st + inst.adTime)
      }
    }

    // detune
    if (sound.detune && 'detune' in inst && inst.detune) {
      rampBy(sound.isFirst ? 'setValueAtTime' : rampers.detune, inst.detune, sound.detune || 0, st);
    }
    // loudness/gain
    if (sound.loudness !== undefined) {
      rampBy(sound.isFirst ? 'setValueAtTime' : rampers.loudness, gain.gain, sound.loudness, st);
    }
    // panner node
    // TODO - Check stereo vs 3d
    if (sound.pan !== undefined) {
      // [check output:] panner.pan.setTargetAtTime(sound.pan, st, 0.35);
      // rampBy(sound.isFirst ? 'setValueAtTime' : rampers.pan, panner.pan, sound.pan, st);
      rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.pan, sound.pan, st, 0.35);
    }

    if (sound.isFirst) {
      // play the first
      startTime = st;
    }
    if (sound.isLast) {
      // smooth ending
      rampBy('linearRampToValueAtTime', gain.gain, (sound.loudness ?? 1), st + 0.05);
      rampBy('linearRampToValueAtTime', gain.gain, 0, st + 0.15);
      if (inst instanceof ErieSynth) {
        inst.envelope.gain.cancelScheduledValues(st);
        rampBy('setValueAtTime', inst.envelope.gain, 1, base_et)
        rampBy('linearRampToValueAtTime', inst.envelope.gain, 0, base_et + inst.adTime);
      }
    }

    for (const filterName of filters) {
      let encoder = filterEncoders[filterName];
      let finisher = filterFinishers[filterName];
      if (encoder) {
        encoder(filterNodes[filterName], sound, st, rampers);
      }
      if (finisher) {
        finisher(filterNodes[filterName], sound, st, base_et + (inst instanceof ErieSynth ? inst.adTime : 0), rampers);
      }
    }
  }

  const tick = makeTick(ctx, config.tick, endTime);

  emitNotePlayEvent('tone', q[0]);
  if (offline && bufferPrimitve && ctx instanceof OfflineAudioContext) {
    if (tick) {
      tick.start(0);
      tick.stop(endTime);
    }
    inst.start(0);
    inst.stop(endTime);
    let rb = await ctx.startRendering();
    bufferPrimitve.add(0, rb);
    inst.onended = (e) => {
      setErieGlobalControl(undefined);
      setErieGlobalState(undefined);
      emitNoteStopEvent('tone', q[0]);
      sendToneFinishEvent({ sid });
    };
  } else {
    return new Promise((resolve: Function, reject: Function) => {
      if (tick) {
        tick.start(startTime);
        tick.stop(ct + endTime);
      }
      inst.start(startTime);
      inst.stop(ct + endTime);
      inst.onended = (e) => {
        setErieGlobalControl(undefined);
        setErieGlobalState(undefined);
        emitNoteStopEvent('tone', q[0]);
        sendToneFinishEvent({ sid });
        resolve();
      };
    });
  }
}

