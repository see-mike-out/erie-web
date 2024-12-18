import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { Glyph } from "../types";

export class DistortionFilter extends AudioFilterPrototype {
  filter: WaveShaperNode;

  constructor(ctx: AudioContext) {
    super(ctx);
    this.ctx = ctx;
    this.filter = ctx.createWaveShaper();
    this.destination = this.filter;
  }
  initialize(s: number, e: number) {
    // s: starting time is not important but for formatting
    this.filter.curve = makeDistortionCurve(e);
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

// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper#examples
function makeDistortionCurve(amount: number) {
  const k = amount ?? 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 10 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function DistortionEncoder(filter: DistortionFilter, sound: Glyph, startTime: number) {
  if (sound.others?.distortion !== undefined) {
    filter.filter.curve = makeDistortionCurve(sound.others.distortion);
  } else {
    filter.filter.curve = makeDistortionCurve(100);
  }
}

export function DistortionFinisher(filter: DistortionFilter, sound: Glyph, startTime: number, duration: number) {
  filter.filter.curve = makeDistortionCurve(50);
}
