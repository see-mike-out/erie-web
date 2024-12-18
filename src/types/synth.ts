export const FM = 'FM', AM = 'AM';
export const SINE = 'sine', SQUARE = 'square', SAWTOOTH = 'sawtooth', TRIANGLE = 'triangle';

export const SynthTypes = [FM, AM];
export type SynthType = typeof AM | typeof FM;
export const OscTypes = [SINE, SQUARE, SAWTOOTH, TRIANGLE];
export type OscType = typeof SINE | typeof SQUARE | typeof SAWTOOTH | typeof TRIANGLE;

export interface SynthObject {
  name: string;
  type: SynthType;
  carrierType: OscType;
  carrierPitch: number;
  carrierDetune: number;
  carrierVolume: number;
  modulatorType: OscType;
  modulatorPitch: number;
  modulatorVolume: number;
  modulation: number;
  harmonicity: number;
  attackTime?: number;
  releaseTime?: number;
  sustain?: number;
  decayTime?: number;
}

export const DefCarrierPitch = 220, DefModPitch = 440, DefaultModGainAM = 0.5, DefaultModGainFM = 10;
export type AudioParamType = 'a-rate' | 'k-rate';