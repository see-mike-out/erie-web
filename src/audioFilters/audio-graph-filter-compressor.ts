import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { AudioFilterEncoder, AudioFilterFinisher, Glyph } from "../types";

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
  finisher() {
  }
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}

export const CompressorEncoder = function (filter: DefaultDynamicCompressor, sound: Glyph, startTime: number) {
  if (sound.others?.dcAttack !== undefined) filter.filter.attack.linearRampToValueAtTime(sound.others.dcAttack || 1, startTime);
  if (sound.others?.dcKnee !== undefined) filter.filter.knee.linearRampToValueAtTime(sound.others.dcKnee || 1, startTime);
  if (sound.others?.dcRatio !== undefined) filter.filter.ratio.linearRampToValueAtTime(sound.others.dcRatio || 1, startTime);
  if (sound.others?.dcReduction !== undefined) filter.filter.release.linearRampToValueAtTime(sound.others.dcReduction || 1, startTime);
  if (sound.others?.dcThreshold !== undefined) filter.filter.threshold.linearRampToValueAtTime(sound.others.dcThreshold || 1, startTime);
} as AudioFilterEncoder

export const CompressorFinisher = function (filter: DefaultDynamicCompressor, sound: Glyph, startTime: number, duration: number) {

} as AudioFilterFinisher;
