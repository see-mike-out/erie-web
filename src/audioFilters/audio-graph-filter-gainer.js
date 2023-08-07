export class GainerFilter {
  constructor(ctx) {
    this.ctx = ctx;
    this.attackTime = 0.1;
    this.releaseTime = 0.1
    this.gainer = ctx.createGain();
    this.destination = this.gainer;
  }
  initialize(time) {
    this.gainer.gain.cancelScheduledValues(time);
    this.gainer.gain.setValueAtTime(0, time);
  }
  finisher(time, duration) {
    this.gainer.gain.linearRampToValueAtTime(0, (time || 0) + (duration || 1) - this.releaseTime);
  }
  connect(node) {
    this.gainer.connect(node);
  }
  disconnect(node) {
    this.gainer.disconnect(node);
  }
}

export function GainerEncoder(filter, sound, startTime) {
  filter.gainer.gain.linearRampToValueAtTime(sound.others?.gain2 || 1, startTime + filter.attackTime);
}

export function GainerFinisher(filter, sound, startTime, duration) {
  filter.gainer.gain.linearRampToValueAtTime(0, (startTime || 0) + (duration || 1) - filter.releaseTime);
}
