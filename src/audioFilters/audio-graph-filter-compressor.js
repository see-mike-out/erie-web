export class DefaultDynamicCompressor {
  constructor(ctx) {
    this.ctx = ctx;
    this.compressor = ctx.createDynamicsCompressor();
    this.destination = this.compressor;
  }
  initialize() {
    this.compressor.attack.value = 20;
    this.compressor.knee.value = 40;
    this.compressor.ratio.value = 18;
    this.compressor.release.value = 0.25;
    this.compressor.threshold.value = -50;
  }
  finisher() {
  }
  connect(node) {
    this.compressor.connect(node);
  }
  disconnect(node) {
    this.compressor.disconnect(node);
  }
}

export function CompressorEncoder(filter, sound, startTime) {
  if (sound.others.dcAttack !== undefined) filter.compressor.attack.linearRampToValueAtTime(sound.others.dcAttack || 1, startTime);
  if (sound.others.dcKnee !== undefined) filter.compressor.knee.linearRampToValueAtTime(sound.others.dcKnee || 1, startTime);
  if (sound.others.dcRatio !== undefined) filter.compressor.ratio.linearRampToValueAtTime(sound.others.dcRatio || 1, startTime);
  if (sound.others.dcReduction !== undefined) filter.compressor.release.linearRampToValueAtTime(sound.others.dcReduction || 1, startTime);
  if (sound.others.dcThreshold !== undefined) filter.compressor.threshold.linearRampToValueAtTime(sound.others.dcThreshold || 1, startTime);
}

export function CompressorFinisher(filter, sound, startTime, duration) {

}
