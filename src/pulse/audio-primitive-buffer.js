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

// todo
// export function concatenateBuffers(...args) {
//   console.log(args);
// }