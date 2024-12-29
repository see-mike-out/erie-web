export class AudioFilterPrototype {
  ctx: AudioContext | OfflineAudioContext;
  filter: AudioNode;
  destination: AudioNode;

  constructor(ctx: AudioContext | OfflineAudioContext) {
    this.ctx = ctx;
    this.filter = ctx.createGain();
    this.destination = this.filter;
  }
  initialize(...args: any[]) {
  }
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}
