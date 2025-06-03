// Oscillator-related
import {
  NoteKey,
  OctaveKey
} from "./octave";

export const SINE = 'sine', SQUARE = 'square', SAWTOOTH = 'sawtooth', TRIANGLE = 'triangle';
export const OscTypes = [SINE, SQUARE, SAWTOOTH, TRIANGLE];
export type OscType = OscillatorType;


export type SamplingItem = {
  [key in NoteKey]?: string;
};

export type LoadedMonoSample = {
  mono: AudioBuffer,
  multiNote: false
};

export type LoadedMultiSample = {
  multiNote: true
} & {
  [key in OctaveKey]: AudioBuffer
};
export type LoadedSample = LoadedMonoSample | LoadedMultiSample;
export type LoadedSampleCollection = { [key: string]: LoadedSample };

// Synth-related
export const FM = 'FM', AM = 'AM';
export const SynthTypes = [FM, AM];
export type SynthType = typeof SynthTypes[number];
export const DefCarrierPitch = 220,
  DefModPitch = 440,
  DefaultModGainAM = 0.5,
  DefaultModGainFM = 10;
export type AudioParamType = 'a-rate' | 'k-rate';

// Wave-related

export interface WaveItem {
  real: number[];
  imag: number[];
}
