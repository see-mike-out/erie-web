export const FM = 'FM', AM = 'AM', DefCarrierPitch = 220, DefModPitch = 440, DefaultModGain = 300;

export function makeSynth(ctx, definition) {
  let synth = new ErieSynth(ctx, definition.type || FM);
  synth.generate(definition);
  return synth;
}

// inspired by https://observablehq.com/@ramonaisonline/synthesis

export class ErieSynth {
  constructor(ctx, type) {
    this.ctx = ctx;
    this.frequency = new ErieSynthFrequency(this);
    this.onended;
    this.type = type;
  }

  generate(definition) {
    if (this.type === FM) {
      this.generateFM(definition);
    } else if (this.type === AM) {
      this.generateAM(definition);
    }
  }

  generateFM(definition) {
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
    this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGain;
    this.modulatorGain.gain.value = this.modulatorVolume;

    // modulator pitch
    if (definition.modulatorPitch !== undefined) {
      this.modulatorPitch = definition.modulatorPitch;
    } else {
      this.modulatorPitch = DefModPitch;
    }
    if (definition.modulation !== undefined) {
      this.modulation = definition.modulation
      this.modulatorPitch = this.modulation * this.modulatorVolume;
    }

    this.modulator.frequency.value = this.modulatorPitch;
    console.log(this.modulator.frequency)



    // envelope
    this.envelope = this.ctx.createGain();
    this.attackTime = definition.attackTime || 0;
    this.releaseTime = definition.releaseTime || 0;
    this.sustain = definition.sustain || 0.8;
    this.decayTime = definition.decayTime || 0;

    // Connect the nodes
    this.modulator.connect(this.modulatorGain);
    this.modulatorGain.connect(this.carrier.frequency);
    this.carrier.connect(this.envelope);
  }

  generateAM(definition) {
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
    this.modulatorVolume = definition.modulatorVolume !== undefined ? definition.modulatorVolume : DefaultModGain;
    this.modulatorGain.gain.value = this.modulatorVolume;

    // modulator pitch 
    if (definition.harmonicity !== undefined) {
      this.modulatorPitch = definition.harmonicity * this.carrierPitch;
    } else {
      this.modulatorPitch = this.carrierPitch;
    }
    this.modulator.frequency.value = this.modulatorPitch;


    // modulator amplitude
    this.amplifier = this.ctx.createWaveShaper();
    this.amplifier.curve = makeWSCurve(1024);

    // envelope
    this.envelope = this.ctx.createGain();
    this.attackTime = definition.attackTime || 0;
    this.releaseTime = definition.releaseTime || 0;

    // Connect the nodes
    this.modulator.connect(this.amplifier);
    this.amplifier.connect(this.modulatorGain);
    this.modulatorGain.connect(this.carrier.detune);
    this.carrier.connect(this.envelope);
  }

  connect(node) {
    this.envelope.connect(node);
  }

  start(time) {
    this.carrier.start(time);
    this.modulator.start(time);
  }

  stop(time) {
    this.carrier.onended = this.onended;
    this.carrier.stop(time + this.attackTime + this.releaseTime);
    this.modulator.stop(time + this.attackTime + this.releaseTime);
  }
}

export class ErieSynthFrequency {
  constructor(synther) {
    this.value = 440;
    this.automationRate = 'a-rate';
    this.maxValue = 22050;
    this.minValue = -22055;
    this.synther = synther;
  }
  setValueAtTime(value, time) {
    this.synther.carrier.frequency.setValueAtTime(value, time);
  }
  setTargetAtTime(value, time) {
    this.synther.carrier.frequency.setTargetAtTime(value, time);
  }
}

// inspired by https://github.com/Tonejs/Tone.js/blob/dev/Tone/signal/AudioToGain.ts#L10
export const AMMppaer = (amount) => (amount + 1) / 2;

function makeWSCurve(len) {
  let curve = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const n = (i / (len - 1)) * 2 - 1;
    curve[i] = AMMppaer(n, i);
  }
}