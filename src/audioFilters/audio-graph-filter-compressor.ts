import { AudioFilterEncoder, AudioFilterFinisher, Glyph, RamperCollection, AudioFilterPrototype } from "../types";
import { rampBy } from "../player/audio-graph-ramp";

export class DefaultDynamicCompressor extends AudioFilterPrototype {
  filter: DynamicsCompressorNode;

  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    this.ctx = ctx;
    this.filter = ctx.createDynamicsCompressor();
    this.destination = this.filter;
  }
  initialize() {
    this.filter.attack.value = 20;
    this.filter.knee.value = 40;
    this.filter.ratio.value = 18;
    this.filter.release.value = 0.25;
    this.filter.threshold.value = -50;
  }
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}

export const CompressorEncoder = function (filter: DefaultDynamicCompressor, sound: Glyph, startTime: number, rampers?: RamperCollection) {
  if (sound.others?.dcAttack !== undefined) rampBy(rampers?.dcAttack, filter.filter.attack, sound.others.dcAttack ?? 1, startTime);
  if (sound.others?.dcKnee !== undefined) rampBy(rampers?.dcKnee, filter.filter.knee, sound.others.dcKnee ?? 1, startTime);
  if (sound.others?.dcRatio !== undefined) rampBy(rampers?.dcRatio, filter.filter.ratio, sound.others.dcRatio ?? 1, startTime);
  if (sound.others?.dcReduction !== undefined) rampBy(rampers?.dcReduction, filter.filter.release, sound.others.dcReduction ?? 1, startTime);
  if (sound.others?.dcThreshold !== undefined) rampBy(rampers?.dcThreshold, filter.filter.threshold, sound.others.dcThreshold ?? 1, startTime);
} as AudioFilterEncoder

export const CompressorFinisher = function (filter: DefaultDynamicCompressor, sound: Glyph, startTime: number, duration: number, rampers?: RamperCollection) {

} as AudioFilterFinisher;
