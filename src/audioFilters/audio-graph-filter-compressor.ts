import { AudioContext, DynamicsCompressorNode, IAudioNode } from "standardized-audio-context";
import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { Glyph } from "../types";

export class DefaultDynamicCompressor extends AudioFilterPrototype {
  filter: DynamicsCompressorNode<AudioContext>;

  constructor(ctx: AudioContext) {
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
  connect(node: IAudioNode<AudioContext>) {
    this.filter.connect(node);
  }
  disconnect(node: IAudioNode<AudioContext>) {
    this.filter.disconnect(node);
  }
}

export function CompressorEncoder(filter: DefaultDynamicCompressor, sound: Glyph, startTime: number) {
  if (sound.others.dcAttack !== undefined) filter.filter.attack.linearRampToValueAtTime(sound.others.dcAttack || 1, startTime);
  if (sound.others.dcKnee !== undefined) filter.filter.knee.linearRampToValueAtTime(sound.others.dcKnee || 1, startTime);
  if (sound.others.dcRatio !== undefined) filter.filter.ratio.linearRampToValueAtTime(sound.others.dcRatio || 1, startTime);
  if (sound.others.dcReduction !== undefined) filter.filter.release.linearRampToValueAtTime(sound.others.dcReduction || 1, startTime);
  if (sound.others.dcThreshold !== undefined) filter.filter.threshold.linearRampToValueAtTime(sound.others.dcThreshold || 1, startTime);
}

export function CompressorFinisher(filter: DefaultDynamicCompressor, sound: Glyph, startTime: number, duration: number) {

}
