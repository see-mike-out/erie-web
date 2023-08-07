export const WhiteNoise = 'whiteNoise', PinkNoise = 'pinkNoise', BrownNoise = 'brownNoise';
export const NoiseTypes = [WhiteNoise, PinkNoise, BrownNoise];

// inspired by : https://noisehack.com/generate-noise-web-audio-api/ (but it's not using audioscriptprocess, which is deprecated)
// and https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques

export function makeNoiseNode(ctx, type, duration, sound) {
  // here, duration is the noise node's duration, for continuous tone it's the entire length;
  const bufferSize = ctx.sampleRate * duration;
  // Create an empty buffer
  const noiseBuffer = new AudioBuffer({
    length: bufferSize,
    sampleRate: ctx.sampleRate,
  });
  // Fill the buffer with noise
  const data = noiseBuffer.getChannelData(0);
  // for pink
  let coeffs = { p0: 0.0, p1: 0.0, p2: 0.0, p3: 0.0, p4: 0.0, p5: 0.0, p6: 0.0, o: 0 };
  for (let i = 0; i < bufferSize; i++) {
    if (type === PinkNoise) {
      PinkNoiseFunction(coeffs);
      data[i] = coeffs.o;
    } else if (type === BrownNoise) {
      BrownNoiseFunction(coeffs);
      data[i] = coeffs.o;
    } else {
      data[i] = WhiteNoiseFunction();
    }
  }
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer;
  return noise;
}

function WhiteNoiseFunction() {
  return Math.random() * 2 - 1;
}

function PinkNoiseFunction(c) {
  let w = WhiteNoiseFunction();
  c.p0 = 0.99886 * c.p0 + w * 0.0555179;
  c.p1 = 0.99332 * c.p1 + w * 0.0750759;
  c.p2 = 0.96900 * c.p2 + w * 0.1538520;
  c.p3 = 0.86650 * c.p3 + w * 0.3104856;
  c.p4 = 0.55000 * c.p4 + w * 0.5329522;
  c.p5 = -0.7616 * c.p5 - w * 0.0168980;
  c.o = c.p0 + c.p1 + c.p2 + c.p3 + c.p4 + c.p5 + c.p6 + w * 0.5362;
  c.o *= 0.11;
  c.p6 = w * 0.115926; // gain compensation
}

function BrownNoiseFunction(c) {
  let w = WhiteNoiseFunction();
  c.o = (c.p0 + (0.02 * w)) / 1.02;
  c.p0 = c.o;
  c.o *= 3.5; // gain compensation
}