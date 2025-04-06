import { Glyph, SynthNormed } from "../types";

export const ChimeStart: Glyph[] = [];

export const ChimeEnd: Glyph[] = [];

export const ChimeAwaiting: Glyph[] = [];

export const ChimeNow: Glyph[] = [];

export const ChimePast: Glyph[] = [];

export const chimeSynth: SynthNormed = {
  name: 'chimeSynth',
  type: 'FM',
  carrierType: 'sine',
  carrierPitch: 220,
  carrierDetune: 0,
  carrierVolume: 1,
  modulatorType: 'sine',
  modulatorPitch: 440,
  modulatorVolume: 1,
  modulation: 1,
  harmonicity: 1,
  attackTime: 0.1,
  releaseTime: 0.15,
  sustain: 0.2,
  decayTime: 0.2
}