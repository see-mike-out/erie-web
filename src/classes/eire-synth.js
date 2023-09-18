import { isInstanceOf } from "./erie-util";

const FM = 'FM', AM = 'AM';
const SINE = 'sine', SQUARE = 'square', SAWTOOTH = 'sawtooth', TRIANGLE = 'triangle';

const SynthTypes = [FM, AM];
export const OscTypes = [SINE, SQUARE, SAWTOOTH, TRIANGLE];

export class SynthTone {
  constructor(name) {
    this._name;
    if (!name) {
      throw new Error('A sampled tone must have a name.')
    }
    this.name(name);
    this._type = 'FM';
    this._carrierType = 'sine';
    this._carrierPitch = 220;
    this._carrierDetune = 0;
    this._modulatorType = 'sine';
    this._modulatorPitch = 440;
    this._modulatorVolume = 0.2;
    this._modulation = 1;
    this._harmonicity = 1;
    this._attackTime = 0;
    this._releaseTime = 0;
  }

  name(n) {
    if (isInstanceOf(n, String)) {
      this._name = n;
    } else {
      throw new TypeError('The name of a synth tone must be String.');
    }

    return this;
  }

  type(t) {
    if (SynthTypes.includes(t)) {
      this._type = t;
    } else {
      throw new TypeError(`The type of a synth tone must be either one of ${SynthTypes.join(', ')}.`);
    }

    return this;
  }

  carrierType(t) {
    if (OscTypes.includes(t)) {
      this._carrierType = t;
    } else {
      throw new TypeError(`The type of a synth carrier must be either one of ${OscTypes.join(', ')}.`);
    }

    return this;
  }

  carrierPitch(p) {
    if (isInstanceOf(p, Number)) {
      this._carrierPitch = p;
    } else {
      throw new TypeError(`The pitch of a synth carrier must be Number.`);
    }

    return this;
  }

  carrierDetune(p) {
    if (isInstanceOf(p, Number) && p >= -1200 && p <= 1200) {
      this._carrierDetune = p;
    } else {
      throw new TypeError(`The detune of a synth carrier must be Number and within [-1200, 1200].`);
    }

    return this;
  }

  modulatorType(t) {
    if (OscTypes.includes(t)) {
      this._modulatorType = t;
    } else {
      throw new TypeError(`The type of a synth modulator must be either one of ${OscTypes.join(', ')}.`);
    }

    return this;
  }

  modulatorPitch(p) {
    if (isInstanceOf(p, Number)) {
      this._modulatorPitch = p;
    } else {
      throw new TypeError(`The pitch of a synth modulator must be Number.`);
    }

    return this;
  }

  modulatorVolume(p) {
    if (isInstanceOf(p, Number) && p >= 0 && p <= 1) {
      this.modulatorVolume = p;
    } else {
      throw new TypeError(`The volume of a synth modulator must be Number and within [0, 1].`);
    }

    return this;
  }

  modulation(p) {
    if (this._type === AM) {
      console.warn('Moudlation index for an AM synth will be ignored.')
    }
    if (isInstanceOf(p, Number) && p > 0) {
      this._modulation = p;
    } else {
      throw new TypeError(`The moudlation index of a synth tone must be Number and greater than 0.`);
    }

    return this;
  }

  harmonicity(p) {
    if (this._type === FM) {
      console.warn('Harmonicity for an FM synth will be ignored.')
    }
    if (isInstanceOf(p, Number) && p > 0) {
      this._harmonicity = p;
    } else {
      throw new TypeError(`The harmonicity of a synth tone must be Number and greater than 0.`);
    }

    return this;
  }

  attackTime(p) {
    if (isInstanceOf(p, Number) && p > 0) {
      this._attackTime = p;
    } else {
      throw new TypeError(`The attack time of a synth tone must be Number and greater than -.`);
    }

    return this;
  }

  releaseTime(p) {
    if (isInstanceOf(p, Number) && p > 0) {
      this._releaseTime = p;
    } else {
      throw new TypeError(`The release time of a synth tone must be Number and greater than -.`);
    }

    return this;
  }

  get() {
    return {
      name: this._name,
      type: this._type,
      carrierType: this._carrierType,
      carrierPitch: this._carrierPitch,
      carrierDetune: this._carrierDetune,
      modulatorType: this._modulatorType,
      modulatorPitch: this._modulatorPitch,
      modulatorVolume: this._modulatorVolume,
      modulation: this._modulation,
      harmonicity: this._harmonicity,
      attackTime: this._attackTime,
      releaseTime: this._releaseTime
    }
  }

  clone() {
    let _c = new SynthTone(this._name);
    _c._type = this._type;
    _c._carrierType = this._carrierType;
    _c._carrierPitch = this._carrierPitch;
    _c._carrierDetune = this._carrierDetune;
    _c._modulatorType = this._modulatorType;
    _c._modulatorPitch = this._modulatorPitch;
    _c._modulatorVolume = this._modulatorVolume;
    _c._modulation = this._modulation;
    _c._harmonicity = this._harmonicity;
    _c._attackTime = this._attackTime;
    _c._releaseTime = this._releaseTime;

    return _c;
  }
}

export class Synth {
  constructor() {
    this.synth = [];
  }

  add(a) {
    if (isInstanceOf(a, SynthTone)) {
      this.synth.push(a);
    } else {
      throw new TypeError('A synth tone must be created using SynthTone class.');
    }

    return this;
  }

  get() {
    return this.synth.map((d) => d.get());
  }

  clone() {
    let _c = new Synth();
    _c.synth = this.synth.map((d) => d.clone());

    return _c;
  }
}