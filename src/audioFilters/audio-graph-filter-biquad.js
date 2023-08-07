// extra channels => biquadDetune, biquadPitch, biquadGain, biquadQ

export class BiquadFilter {
  constructor(ctx) {
    this.ctx = ctx;
    this.filter = ctx.createBiquadFilter();
    this.destination = this.filter;
  }
  initialize(time) {
    this.filter.gain.setValueAtTime(1, time);
  }
  connect(node) {
    this.filter.connect(node);
  }
  disconnect(node) {
    this.filter.disconnect(node);
  }
}

export class LowpassBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'lowpass';
    this.destination = this.filter;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}


export class HighpassBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'highpass';
    this.destination = this.filter;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}


export class BandpassBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'bandpass';
    this.destination = this.filter;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}


export class LowshelfBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'lowshelf';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}

export class HighshelfBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'highshelf';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}

export class PeakingBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'peaking';
    this.destination = this.filter;
    this.useGain = true;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}

export class NotchBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'notch';
    this.destination = this.filter;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}

export class AllpassBiquadFilter extends BiquadFilter {
  constructor(ctx) {
    super(ctx);
    this.filter.type = 'allpass';
    this.destination = this.filter;
  }
  connect(node) {
    this.destination.connect(node);
  }
  disconnect(node) {
    this.destination.disconnect(node);
  }
}

export function BiquadEncoder(filter, sound, startTime) {
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

export function BiquadFinisher(filter, sound, startTime, duration) {
  if (filter.useGain) {
    filter.filter.gain.setValueAtTime((sound?.others.biquadGain || 1), startTime + duration);
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
