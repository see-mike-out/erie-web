import { AudioContext, IAudioNode } from "standardized-audio-context";

export class AudioFilterPrototype {
  ctx: AudioContext;
  filter: IAudioNode<AudioContext>;
  destination: IAudioNode<AudioContext>;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.filter = ctx.createGain();
    this.destination = this.filter;
  }
  initialize(...args: any[]) {
  }
  connect(node: IAudioNode<AudioContext>) {
    this.filter.connect(node);
  }
  disconnect(node: IAudioNode<AudioContext>) {
    this.filter.disconnect(node);
  }
}
