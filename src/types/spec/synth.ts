import {
  OscType,
  SynthType
} from "../object";

export interface SynthSpec {
  name: string;
  type: SynthType;
  carrierType?: OscType;
  carrierPitch?: number;
  carrierDetune?: number;
  carrierVolume?: number;
  modulatorType?: OscType;
  modulatorPitch?: number;
  modulatorVolume?: number;
  modulation?: number;
  harmonicity: number;
  attackTime?: number;
  releaseTime?: number;
  sustain?: number;
  decayTime?: number;
}