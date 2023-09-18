export class DistortionFilter {
  constructor(ctx) {
    this.ctx = ctx;
    this.distortion = ctx.createWaveShaper();
    this.destination = this.distortion;
  }
  initialize(s, e) {
    this.distortion.curve = makeDistortionCurve(e);
  }
  finisher() {
  }
  connect(node) {
    this.distortion.connect(node);
  }
  disconnect(node) {
    this.distortion.disconnect(node);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper#examples
function makeDistortionCurve(amount) {
  const k = typeof amount === "number" ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 10 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function DistortionEncoder(filter, sound, startTime) {
  if (sound.others.distortion !== undefined) {
    filter.distortion.curve = makeDistortionCurve(sound.others.distortion);
  }
}

export function DistortionFinisher(filter, sound, startTime, duration) {
  filter.distortion.curve = makeDistortionCurve(50);
}
