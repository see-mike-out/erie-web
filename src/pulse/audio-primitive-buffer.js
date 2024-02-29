import { AudioContext } from "standardized-audio-context";

const SampleRate = 44100, BufferChannels = 2;

export class AudioPrimitiveBuffer {
  constructor(length, sampleRate) {
    // in seconds
    this.length = length;
    this.sampleRate = sampleRate || SampleRate;
    this.compiled = false;
    this.compiledBuffer;
    this.primitive = [];
  }

  add(at, data) {
    this.primitive.push({ at, data });
  }

  async compile() {
    let maxChannels = Math.max(...this.primitive.map((p) => p.data.numberOfChannels || BufferChannels));
    let bufferLength = this.length * this.sampleRate;
    let temp_ctx = new AudioContext();
    this.compiledBuffer = temp_ctx.createBuffer(
      maxChannels,
      bufferLength,
      this.sampleRate,
    );;
    for (const p of this.primitive) {
      let at = (p.at || 0) * 44100;
      for (let i = 0; i < p.data.numberOfChannels; i++) {
        let channelData = this.compiledBuffer.getChannelData(i);
        let currChannelData = p.data.getChannelData(i);
        currChannelData.forEach((q, k) => {
          channelData[at + k] += q;
        })
      }
    }
    this.compiled = true;
    return this.compiledBuffer;
  }
}


export function concatenateBuffers(buffers) {
  let totalLength = buffers.map((d) => d?.length || 0).reduce((a, c) => a + c, 0);
  let ctx = new AudioContext();
  let totalBuffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
  let view = 0;
  for (const buffer of buffers) {
    for (let i = 0; i < 2; i++) {
      let channelData = totalBuffer.getChannelData(i);
      let currChannelData;
      if (buffer.numberOfChannels == 1) currChannelData = buffer.getChannelData(0);
      else if (buffer.numberOfChannels == 2) currChannelData = buffer.getChannelData(1);
      for (let j = 0; j < buffer.length; j++) {
        channelData[view + j] = currChannelData[j];
      }
    }
    view += buffer.length;
  }
  return totalBuffer;
}