import { ErieSynth } from '../audio-graph-synth';
import { PresetFilters } from '../audio-graph-audio-filter';
import {
  sendToneStartEvent
} from '../audio-graph-player-event';
import {
  emitNotePlayEvent
} from "../audio-graph-note-event";
import {
  makeInstrument
} from '../audio-graph-make';
import {
  setCurrentTime,
  setErieGlobalControl,
  setErieGlobalState
} from '../audio-graph-player-global';
import {
  createPanner
} from '../audio-graph-panner'
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
  Glyph,
  AudioFilterFinisher,
  AudioFilterEncoder,
  RamperCollection,
  RamperNames,
  HashedObject,
  SynthNormed,
  WaveNormed,
  AudioFilterPrototype,
  StreamerInstrument,
  InstrumentNode
} from '../../types';
import {
  makeTick,
} from '../../tick';
import {
  genRid
} from '../../util';
import { AudioPrimitiveBuffer } from '../../pulse'
import { NoiseTypes } from '../audio-graph-noise';


// todo -> fix
export function playIndefininteContinuousTones(
  _ctx: AudioContext,
  base: Glyph,
  config: ConfigInterface,
  instSamples: LoadedSampleCollection,
  synthDefs: HashedObject<SynthNormed>,
  waveDefs: HashedObject<WaveNormed>,
  filters: string[],
  bufferPrimitve: AudioPrimitiveBuffer | undefined
): StreamerInstrument {
  // clear previous state
  setErieGlobalState(undefined);

  // get the context
  let ctx: AudioContext = _ctx;

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
      try {
        filter.connect(destination);
        filter.initialize(ctx.currentTime);
        destination = filter.destination;
      } catch {
        console.warn(`${filterName} cannot be connected and hence is ignored because it can't be run for an indefinite time.`)
      }
    }
  }

  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);

  // decide between stereo or 3d pan
  const cartesianInputs = ['panX', 'panY', 'panZ'].filter(key => base[key] !== undefined).length;
  const isStereo = cartesianInputs === 1 && base.panX !== undefined;
  const panner = createPanner(ctx, cartesianInputs);
  panner.connect(gain);

  let sid = genRid()
  sendToneStartEvent({ sid });

  // check applicable instrument type
  if (NoiseTypes.includes(config?.instrument_type)) {
    console.error("Cannot play an indefininte noise.");
  } else if (config?.instrument_type in instSamples) {
    console.error("Cannot play an indefininte sample.");
  }
  // get instrument
  const inst = makeInstrument(ctx, config?.instrument_type, instSamples, synthDefs, waveDefs, base, undefined);

  inst.connect(panner);
  // get the current time
  let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
  if (inst instanceof OscillatorNode) {
    // osc pitch
    console.log(base.pitch ?? DefaultFrequency, ct)
    rampBy('setValueAtTime', inst.frequency, base.pitch ?? DefaultFrequency, ct);
  } else if (inst instanceof ErieSynth) {
    // synth pitch
    rampBy('setValueAtTime', inst.frequency, base.pitch ?? DefaultFrequency, ct);
    // modulation
    if (inst.type === FM && base.modulation !== undefined && base.modulation > 0) {
      rampBy('setValueAtTime', inst.modulator.frequency, (inst.modulatorVolume / base.modulation), ct);
    } else if (inst.type === AM && base.modulation !== undefined) {
      rampBy('setValueAtTime', inst.modulatorGain.gain, (base.loudness ?? 0.1) * base.modulation, ct);
    }
    // hamonicity
    if (base.harmonicity !== undefined && base.harmonicity > 0) {
      rampBy('setValueAtTime', inst.modulator.frequency, (base.pitch ?? inst.carrierPitch ?? DefaultFrequency) * base.harmonicity, ct);
    }
    // initialize the envelope
    inst.envelope.gain.cancelScheduledValues(ct);
    // before attack
    rampBy('setValueAtTime', inst.envelope.gain, 0, ct)
  }

  // detune
  if (base.detune && 'detune' in inst && inst.detune) {
    rampBy('setValueAtTime', inst.detune, base.detune || 0, ct);
  }
  // loudness/gain
  if (base.loudness !== undefined) {
    rampBy('setValueAtTime', gain.gain, base.loudness, ct);
  }


  if (isStereo && base.panX !== undefined && panner instanceof StereoPannerNode) {
    rampBy('setValueAtTime', panner.pan, base.panX, ct, 0.35);
  } else if (!isStereo && panner instanceof PannerNode) {
    if (base.panX !== undefined) rampBy('setTargetAtTime', panner.positionX, base.panX, ct, 0.35);
    if (base.panY !== undefined) rampBy('setTargetAtTime', panner.positionY, base.panY, ct, 0.35);
    if (base.panZ !== undefined) rampBy('setTargetAtTime', panner.positionZ, base.panZ, ct, 0.35);
  }
  for (const filterName of filters) {
    let encoder = filterEncoders[filterName];
    if (encoder) {
      encoder(filterNodes[filterName], base, ct, rampers);
    }
  }

  const tick = makeTick(ctx, config.tick, 'indefinite') as (() => InstrumentNode);
  if (tick) {
    function play_tick() {
      let t = tick() as InstrumentNode
      let st = ctx.currentTime
      t.start(st);
      t.stop(st + config.tick.band);
    }
    play_tick();
    let tick_interval_id = setInterval(play_tick, config.tick.band);
    inst.onended = () => {
      clearInterval(tick_interval_id);
    };
  }
  inst.start(ct);
  emitNotePlayEvent('tone', base);
  return {
    inst,
    gain,
    filterNodes,
    filterEncoders,
    filterFinishers,
    tick,
    panner,
    isStereo,
    destination,
    rampers
  }
}

