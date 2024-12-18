// extra channels => biquadDetune, biquadPitch, biquadGain, biquadQ

import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { Glyph } from "../types";

export class BiquadFilter extends AudioFilterPrototype {
  filter: BiquadFilterNode;
  destination: BiquadFilterNode;
  useGain: boolean;

  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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
  constructor(ctx: AudioContext) {
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

export function BiquadEncoder(filter: BiquadFilter, sound: Glyph, startTime: number) {
  if (filter.useGain) {
    if (startTime > 0) filter.filter.gain.linearRampToValueAtTime((sound?.others?.biquadGain || 1), startTime);
    else filter.filter.gain.setValueAtTime((sound?.others?.biquadGain || 1), startTime);
  }
  if (sound?.others?.biquadPitch !== undefined) {
    if (startTime > 0) filter.filter.frequency.linearRampToValueAtTime((sound.others.biquadPitch || 1), startTime);
    else filter.filter.frequency.setValueAtTime((sound.others.biquadPitch || 1), startTime);
  }
  if (sound?.others?.biquadQ !== undefined) {
    if (startTime > 0) filter.filter.Q.linearRampToValueAtTime((sound.others.biquadQ || 1), startTime);
    else filter.filter.Q.setValueAtTime((sound.others.biquadQ || 1), startTime);
  }
  if (sound?.others?.biquadDetune !== undefined) {
    if (startTime > 0) filter.filter.detune.linearRampToValueAtTime((sound.others.biquadDetune || 1), startTime);
    else filter.filter.detune.setValueAtTime((sound.others.biquadDetune || 1), startTime);
  }
}

export function BiquadFinisher(filter: BiquadFilter, sound: Glyph, startTime: number, duration: number) {
  if (filter.useGain) {
    filter.filter.gain.setValueAtTime((sound?.others?.biquadGain || 1), startTime + duration);
  }
  if (sound?.others?.biquadPitch !== undefined) {
    filter.filter.frequency.setValueAtTime((sound.others.biquadPitch || 1), startTime + duration);
  }
  if (sound?.others?.biquadQ !== undefined) {
    filter.filter.Q.setValueAtTime((sound.others.biquadQ || 1), startTime + duration);
  }
  if (sound?.others?.biquadDetune !== undefined) {
    filter.filter.detune.setValueAtTime((sound.others.biquadDetune || 1), startTime + duration);
  }
}
