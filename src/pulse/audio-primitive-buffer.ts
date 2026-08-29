import { BufferDataItem } from "../types";

const SampleRate = 44100, BufferChannels = 2;

export class AudioPrimitiveBuffer {
  length: number;
  sampleRate: number;
  compiled: boolean;
  compiledBuffer?: AudioBuffer;
  primitive: Array<BufferDataItem>;

  constructor(length: number, sampleRate?: number) {
    // in seconds
    this.length = length;
    this.sampleRate = sampleRate || SampleRate;
    this.compiled = false;
    this.compiledBuffer;
    this.primitive = [];
  }

  add(at: number | "next", data: AudioBuffer) {
    this.primitive.push({ at, data });
  }

  async compile() {
    let maxChannels = Math.max(...this.primitive.map((p) => p.data.numberOfChannels || BufferChannels)) || BufferChannels;
    if (maxChannels < 1) maxChannels = BufferChannels;
    else if (maxChannels > 32) maxChannels = 32;
    let bufferLength = this.length ? this.length * this.sampleRate : this.primitive.map((p) => p.data.length).reduce((a, c) => a + c, 0);
    if (bufferLength == 0) bufferLength = this.sampleRate * 0.1;
    let temp_ctx = new AudioContext();
    this.compiledBuffer = temp_ctx.createBuffer(
      maxChannels,
      bufferLength,
      this.sampleRate,
    );
    let lastAt;
    for (const p of this.primitive) {
      let at: number = p.at === "next" ? (lastAt || 0) : Math.round((p.at || 0) * 44100);
      for (let i = 0; i < maxChannels; i++) {
        let channelData = this.compiledBuffer.getChannelData(i);
        let currChannelData = p.data.getChannelData(i % p.data.numberOfChannels);
        currChannelData.forEach((q, k) => {
          channelData[at + k] += q;
        })
      }
      lastAt = at + p.data.length;
    }
    this.compiled = true;
    return this.compiledBuffer;
  }
}


export function concatenateBuffers(buffers: AudioBuffer[]) {
  let totalLength = buffers.map((d) => d?.length || 0).reduce((a, c) => a + c, 0);
  let ctx = new AudioContext();
  let totalBuffer = ctx.createBuffer(2, totalLength, ctx.sampleRate);
  let view = 0;
  for (const buffer of buffers) {
    for (let i = 0; i < 2; i++) {
      let channelData = totalBuffer.getChannelData(i);
      let currChannelData = buffer.numberOfChannels == 1 ? buffer.getChannelData(0) : buffer.getChannelData(i);
      for (let j = 0; j < buffer.length; j++) {
        channelData[view + j] = currChannelData[j];
      }
    }
    view += buffer.length;
  }
  return totalBuffer;
}