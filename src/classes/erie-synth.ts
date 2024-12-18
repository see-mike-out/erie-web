import {
  AM,
  FM,
  OscType,
  SynthObject,
  SynthType
} from "../types/synth";

export class SynthTone {
  _name: string;
  _type: SynthType;
  _carrierType: OscType;
  _carrierPitch: number;
  _carrierDetune: number;
  _carrierVolume: number;
  _modulatorType: OscType;
  _modulatorPitch: number;
  _modulatorVolume: number;
  _modulation: number;
  _harmonicity: number;
  _attackTime: number;
  _releaseTime: number;
  _sustain: number;
  _decayTime: number;

  constructor(name: string) {
    this._name = name;
    this._type = 'FM';
    this._carrierType = 'sine';
    this._carrierPitch = 220;
    this._carrierDetune = 0;
    this._carrierVolume = 1;
    this._modulatorType = 'sine';
    this._modulatorPitch = 440;
    this._modulatorVolume = 0.2;
    this._modulation = 1;
    this._harmonicity = 1;
    this._attackTime = 0;
    this._releaseTime = 0;
    this._sustain = 0.8;
    this._decayTime = 0.1;
  }

  name(n: string) {
    this._name = n;
    return this;
  }

  type(t: SynthType) {
    this._type = t;
    return this;
  }

  carrierType(t: OscType) {
    this._carrierType = t;
    return this;
  }

  carrierPitch(p: number) {
    if (p >= 0) {
      this._carrierPitch = p;
    } else {
      throw new TypeError(`The carrier pitch of a synth tone must be equal to or greater than 0.`);
    }
    return this;
  }

  carrierDetune(p: number) {
    if (p >= -1200 && p <= 1200) {
      this._carrierDetune = p;
    } else {
      throw new TypeError(`The carreir detune of a synth tone must be between -1200 and 1200.`);
    }
    return this;
  }

  modulatorType(t: OscType) {
    this._modulatorType = t;
    return this;
  }

  modulatorPitch(p: number) {
    if (p >= 0) {
      this._modulatorPitch = p;
    } else {
      throw new TypeError(`The modulator volume of a synth tone must be equal to or greater than 0.`);
    }
    return this;
  }

  modulatorVolume(p: number) {
    if (p >= 0) {
      this._modulatorVolume = p;
    } else {
      throw new TypeError(`The modulator volume of a synth tone must be equal to or greater than 0.`);
    }
    return this;
  }

  modulation(p: number) {
    if (this._type === AM) {
      console.warn('Moudlation index for an AM synth will be ignored.')
    }
    if (p > 0) {
      this._modulation = p;
    } else {
      throw new TypeError(`The moudlation index of a synth tone must be Number and greater than 0.`);
    }

    return this;
  }

  harmonicity(p: number) {
    if (this._type === FM) {
      console.warn('Harmonicity for an FM synth will be ignored.')
    }
    if (p > 0) {
      this._harmonicity = p;
    } else {
      throw new TypeError(`The harmonicity of a synth tone must be Number and greater than 0.`);
    }

    return this;
  }

  attackTime(p: number) {
    if (p > 0) {
      this._attackTime = p;
    } else {
      throw new TypeError(`The attack time of a synth tone must be Number and greater than 0.`);
    }

    return this;
  }

  releaseTime(p: number) {
    if (p >= 0) {
      this._releaseTime = p;
    } else {
      throw new TypeError(`The release time of a synth tone must be equal to or greater than 0.`);
    }

    return this;
  }

  get(): SynthObject {
    return {
      name: this._name,
      type: this._type,
      carrierType: this._carrierType,
      carrierPitch: this._carrierPitch,
      carrierDetune: this._carrierDetune,
      carrierVolume: this._carrierVolume,
      modulatorType: this._modulatorType,
      modulatorPitch: this._modulatorPitch,
      modulatorVolume: this._modulatorVolume,
      modulation: this._modulation,
      harmonicity: this._harmonicity,
      attackTime: this._attackTime,
      releaseTime: this._releaseTime,
      sustain: this._sustain,
      decayTime: this._decayTime
    }
  }

  clone(): SynthTone {
    let _c = new SynthTone(this._name);
    _c._type = this._type;
    _c._carrierType = this._carrierType;
    _c._carrierPitch = this._carrierPitch;
    _c._carrierDetune = this._carrierDetune;
    _c._carrierVolume = this._carrierVolume;
    _c._modulatorType = this._modulatorType;
    _c._modulatorPitch = this._modulatorPitch;
    _c._modulatorVolume = this._modulatorVolume;
    _c._modulation = this._modulation;
    _c._harmonicity = this._harmonicity;
    _c._attackTime = this._attackTime;
    _c._releaseTime = this._releaseTime;
    _c._sustain = this._sustain;
    _c._decayTime = this._decayTime;

    return _c;
  }
}

export class Synth {
  synth: SynthTone[];

  constructor() {
    this.synth = [];
  }

  add(a: SynthTone) {
    this.synth.push(a);
    return this;
  }

  get(): SynthObject[] {
    return this.synth.map((d) => d.get());
  }

  clone(): Synth {
    let _c = new Synth();
    _c.synth = this.synth.map((d) => d.clone());
    return _c;
  }
}