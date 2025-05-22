// extra channels => biquadDetune, biquadPitch, biquadGain, biquadQ
import {
  AudioFilterEncoder,
  AudioFilterFinisher,
  Glyph,
  RamperCollection,
  AudioFilterPrototype
} from "../types";
import { rampBy } from "../player/audio-graph-ramp";

export class BiquadFilter extends AudioFilterPrototype {
  filter: BiquadFilterNode;
  destination: BiquadFilterNode;
  useGain: boolean;

  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.ctx = ctx;
    this.filter = ctx.createBiquadFilter();
    this.destination = this.filter;
    this.useGain = false;
  }
  initialize(time: number) {
    this.filter.gain.setValueAtTime(1, time);
  }
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}

export class LowpassBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'lowpass';
    this.destination = this.filter;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class HighpassBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'highpass';
    this.destination = this.filter;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class BandpassBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'bandpass';
    this.destination = this.filter;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class LowshelfBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'lowshelf';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class HighshelfBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'highshelf';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class PeakingBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'peaking';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class NotchBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'notch';
    this.destination = this.filter;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export class AllpassBiquadFilter extends BiquadFilter {
  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.filter.type = 'allpass';
    this.destination = this.filter;
  }
  connect(node: AudioNode) {
    this.destination.connect(node);
  }
  disconnect(node: AudioNode) {
    this.destination.disconnect(node);
  }
}

export const BiquadEncoder = function (filter: BiquadFilter, sound: Glyph, startTime: number, rampers?: RamperCollection) {
  if (filter.useGain) {
    rampBy(startTime == 0 ? 'setValueAtTime' : rampers?.biquadGain, filter.filter.gain, (sound?.others?.biquadGain ?? 1), startTime);
  }
  if (sound?.others?.biquadPitch !== undefined) {
    rampBy(startTime == 0 ? 'setValueAtTime' : rampers?.biquadPitch, filter.filter.frequency, (sound.others.biquadPitch ?? 1), startTime);
  }
  if (sound?.others?.biquadQ !== undefined) {
    rampBy(startTime == 0 ? 'setValueAtTime' : rampers?.biquadQ, filter.filter.Q, (sound.others.biquadQ ?? 1), startTime);
  }
  if (sound?.others?.biquadDetune !== undefined) {
    rampBy(startTime == 0 ? 'setValueAtTime' : rampers?.biquadDetune, filter.filter.detune, (sound.others.biquadDetune ?? 1), startTime);
  }
} as AudioFilterEncoder

export const BiquadFinisher = function (filter: BiquadFilter, sound: Glyph, startTime: number, duration: number, rampers?: RamperCollection) {
  if (filter.useGain) {
    filter.filter.gain.setValueAtTime((sound?.others?.biquadGain ?? 1), startTime + duration);
  }
  if (sound?.others?.biquadPitch !== undefined) {
    filter.filter.frequency.setValueAtTime((sound.others.biquadPitch ?? 1), startTime + duration);
  }
  if (sound?.others?.biquadQ !== undefined) {
    filter.filter.Q.setValueAtTime((sound.others.biquadQ ?? 1), startTime + duration);
  }
  if (sound?.others?.biquadDetune !== undefined) {
    filter.filter.detune.setValueAtTime((sound.others.biquadDetune ?? 1), startTime + duration);
  }
} as AudioFilterFinisher
