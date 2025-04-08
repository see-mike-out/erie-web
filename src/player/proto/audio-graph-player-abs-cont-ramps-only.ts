import {
  AM,
  AudioFilterEncoder,
  AudioFilterFinisher,
  AudioFilterPrototype,
  ConfigInterface,
  DefaultFrequency,
  FM,
  Glyphs2,
  HashedObject,
  InstrumentNode,
  RamperCollection,
  RecordObject
} from "../../types";
import { getEndTime1, getStartTime1 } from "../../util";
import { setCurrentTime } from "../audio-graph-player-global";
import { rampBy } from "../audio-graph-ramp";
import { ErieSynth } from "../audio-graph-synth";
import { playPause } from "./audio-graph-player-pause";

export async function rampContinuousTone(
  ctx: AudioContext,
  q: Glyphs2,
  duration: number,
  inst: InstrumentNode,
  panner: PannerNode | StereoPannerNode,
  isStereo: boolean,
  gain: GainNode,
  rampers: RamperCollection,
  filters: string[],
  filterNodes: HashedObject<AudioFilterPrototype>,
  filterEncoders: HashedObject<AudioFilterEncoder>,
  filterFinishers: HashedObject<AudioFilterFinisher>,
  config: ConfigInterface
) {
  let startTime!: number;
  // get the current time
  let ct = setCurrentTime(ctx);
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
    // DONE - Check stereo vs 3d
    if (isStereo && sound.panX !== undefined && panner instanceof StereoPannerNode) {
      rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.pan, sound.panX, st, 0.35);
    } else if (!isStereo && panner instanceof PannerNode) {
      if (sound.panX !== undefined) rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.positionX, sound.panX, st, 0.35);
      if (sound.panY !== undefined) rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.positionY, sound.panY, st, 0.35);
      if (sound.panZ !== undefined) rampBy(sound.isFirst ? 'setTargetAtTime' : rampers.pan, panner.positionZ, sound.panZ, st, 0.35);
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

  await playPause(duration * 1000)
  return;
}