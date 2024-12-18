import {
  AM,
  AudioParamType,
  DefaultModGainAM,
  DefaultModGainFM,
  DefCarrierPitch,
  DefModPitch,
  FM,
  OscType,
  SynthObject
} from "../types";

export function makeSynth(
  ctx: AudioContext,
  definition: SynthObject
): ErieSynth {
  let synth = new ErieSynth(ctx, definition.type || FM);
  synth.generate(definition);
  return synth;
}

export class ErieSynth {
  // definition
  ctx: AudioContext;
  frequency: ErieSynthFrequency;
  onended!: (a: Event) => {};
  type: string;
  initDef!: SynthObject;
  // carrier
  carrier!: OscillatorNode;
  carrierPitch!: number;
  carrierType!: OscType;
  carrierVolume!: number;
  carrierDetune!: number;
  // modulator
  modulator!: OscillatorNode;
  modulatorType!: OscType;
  modulatorGain!: GainNode;
  modulatorVolume!: number;
  modulatorPitch!: number;
  modulation!: number;
  // envelope
  envelope!: GainNode;
  attackTime!: number;
  releaseTime!: number;
  sustain!: number;
  decayTime!: number;


  constructor(
    ctx: AudioContext,
    type: string
  ) {
    this.ctx = ctx;
    this.frequency = new ErieSynthFrequency(this);
    this.onended;
    this.type = type;
  }

  generate(definition: SynthObject) {
    if (this.type === FM) {
      this.generateFM(definition);
    } else if (this.type === AM) {
      this.generateAM(definition);
    }
  }

  generateFM(definition: SynthObject) {
    this.initDef = definition;

    // carrier
    this.carrier = this.ctx.createOscillator();
    this.carrierPitch = definition.carrierPitch !== undefined ? definition.carrierPitch : DefCarrierPitch;
    this.carrier.frequency.value = this.carrierPitch;
    this.carrier.type = definition.carrierType || 'sine';
    this.carrierType = definition.carrierType || 'sine';
    if (definition.carrierDetune) {
      this.carrierDetune = definition.carrierDetune;
      this.carrier.detune.value = definition.carrierDetune;
    }

    // modulator
    this.modulator = this.ctx.createOscillator();
    this.modulator.type = definition.modulatorType || 'sine';
    this.modulatorType = definition.modulatorType || 'sine';

    // modulator gain
    this.modulatorGain = this.ctx.createGain();
    this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGainFM;
    this.modulatorGain.gain.value = this.modulatorVolume;

    // modulator pitch > modulation index > harmonicity > carrier's pitch > default pitch
    if (definition.modulatorPitch !== undefined) {
      this.modulatorPitch = definition.modulatorPitch;
    } else if (definition.modulation !== undefined) {
      this.modulation = definition.modulation
      this.modulatorPitch = this.modulatorVolume / this.modulation;
    } else if (definition.harmonicity !== undefined) {
      this.modulatorPitch = definition.harmonicity * this.carrierPitch;
    } else if (this.carrierPitch !== undefined) {
      this.modulatorPitch = this.carrierPitch;
    } else {
      this.modulatorPitch = DefModPitch;
    }
    this.modulator.frequency.value = this.modulatorPitch;

    // envelope
    this.envelope = this.ctx.createGain();
    this.attackTime = definition.attackTime || 0.1;
    this.releaseTime = definition.releaseTime || 0.1;
    this.sustain = definition.sustain || 0.8;
    this.decayTime = definition.decayTime || 0.2;

    // Connect the nodes
    this.modulator.connect(this.modulatorGain);
    this.modulatorGain.connect(this.carrier.frequency);
    this.carrier.connect(this.envelope)
  }

  generateAM(definition: SynthObject) {
    this.initDef = definition;

    // carrier
    this.carrier = this.ctx.createOscillator();
    this.carrierPitch = definition.carrierPitch !== undefined ? definition.carrierPitch : DefCarrierPitch;
    this.carrier.frequency.value = this.carrierPitch;
    this.carrier.type = definition.carrierType || 'sine';
    this.carrierType = definition.carrierType || 'sine';
    if (definition.carrierDetune) {
      this.carrierDetune = definition.carrierDetune;
      this.carrier.detune.value = definition.carrierDetune;
    }
    this.carrierVolume = definition.carrierVolume ?? 1;

    // modulator
    this.modulator = this.ctx.createOscillator();
    this.modulator.type = definition.modulatorType ?? 'sine';
    this.modulatorType = definition.modulatorType ?? 'sine';

    // modulator gain
    this.modulatorGain = this.ctx.createGain();
    if (definition.modulation !== undefined) {
      this.modulation = definition.modulation
      this.modulatorVolume = (this.carrierVolume ?? 1) * this.modulation;
    } else {
      this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGainAM;
    }
    this.modulatorGain.gain.value = this.modulatorVolume;

    // modulator pitch 
    if (definition.modulatorPitch !== undefined) {
      this.modulatorPitch = definition.modulatorPitch;
    } else if (definition.harmonicity !== undefined) {
      this.modulatorPitch = definition.harmonicity * this.carrierPitch;
    } else if (this.carrierPitch !== undefined) {
      this.modulatorPitch = this.carrierPitch;
    } else {
      this.modulatorPitch = DefModPitch;
    }
    this.modulator.frequency.value = this.modulatorPitch;

    // envelope
    this.envelope = this.ctx.createGain();
    this.attackTime = definition.attackTime ?? 0.1;
    this.releaseTime = definition.releaseTime ?? 0.05;
    this.sustain = definition.sustain ?? 0.8;
    this.decayTime = definition.decayTime ?? 0.1;

    // Connect the nodes
    this.modulator.connect(this.modulatorGain.gain);
    this.carrier.connect(this.modulatorGain);
    this.modulatorGain.connect(this.envelope);
  }

  connect(node: AudioNode) {
    this.envelope.connect(node);
  }

  start(time: number) {
    this.carrier.start(time);
    this.modulator.start(time);
  }

  stop(time: number) {
    this.carrier.onended = this.onended;
    this.carrier.stop(time + this.attackTime + this.releaseTime);
    this.modulator.stop(time + this.attackTime + this.releaseTime);
  }
}

export class ErieSynthFrequency {
  value: number;
  automationRate: AudioParamType;
  maxValue: number;
  minValue: number;
  synther: ErieSynth;

  constructor(synther: ErieSynth) {
    this.value = DefModPitch;
    this.automationRate = 'a-rate';
    this.maxValue = 22050;
    this.minValue = -22055;
    this.synther = synther;
  }
  setValueAtTime(value: number, time: number) {
    this.synther.carrier.frequency.setValueAtTime(value, time);
  }
  setTargetAtTime(value: number, time: number, timeConstant: number) {
    this.synther.carrier.frequency.setTargetAtTime(value, time, timeConstant);
  }
  linearRampToValueAtTime(value: number, endTime: number) {
    this.synther.carrier.frequency.linearRampToValueAtTime(value, endTime);
  }
  exponentialRampToValueAtTime(value: number, endTime: number) {
    this.synther.carrier.frequency.exponentialRampToValueAtTime(value, endTime);
  }
  setValueCurveAtTime(values: number[], startTime: number, duration: number) {
    this.synther.carrier.frequency.setValueCurveAtTime(values, startTime, duration);
  }

}

// inspired by https://github.com/Tonejs/Tone.js/blob/dev/Tone/signal/AudioToGain.ts#L10
export const AMMppaer = (amount: number) => (amount + 1) / 2;

function makeWSCurve(len: number) {
  let curve = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const n = (i / (len - 1)) * 2 - 1;
    curve[i] = AMMppaer(n);
  }
}