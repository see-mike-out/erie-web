import { AudioContext, GainNode, IAudioNode } from "standardized-audio-context";
import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { Glyph } from "../types";

export class GainerFilter extends AudioFilterPrototype {
  attackTime: number;
  releaseTime: number;
  filter: GainNode<AudioContext>;

  constructor(ctx: AudioContext) {
    super(ctx);
    this.ctx = ctx;
    this.attackTime = 0.1;
    this.releaseTime = 0.1
    this.filter = ctx.createGain();
    this.destination = this.filter; // this has to be done.
  }
  initialize(time: number) {
    this.filter.gain.cancelScheduledValues(time);
    this.filter.gain.setValueAtTime(0, time);
  }
  finisher(time: number, duration: number) {
    this.filter.gain.linearRampToValueAtTime(0, (time || 0) + (duration || 1) - this.releaseTime);
  }
  connect(node: IAudioNode<AudioContext>) {
    this.filter.connect(node);
  }
  disconnect(node: IAudioNode<AudioContext>) {
    this.filter.disconnect(node);
  }
}

export function GainerEncoder(filter: GainerFilter, sound: Glyph, startTime: number) {
  filter.filter.gain.linearRampToValueAtTime(sound.others?.gain2 || 1, startTime + filter.attackTime);
}

export function GainerFinisher(filter: GainerFilter, sound: Glyph, startTime: number, duration: number) {
  filter.filter.gain.linearRampToValueAtTime(0, (startTime || 0) + (duration || 1) - filter.releaseTime);
}
