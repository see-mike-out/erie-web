// The below code is adopted from: https://russellgood.com/how-to-convert-audiowaveBuffer-to-audio-file/

export async function makeWaveFromBuffer(buffer, ext) {
  let nChannels = buffer.numberOfChannels,
    samples = buffer.length,
    sampleRate = buffer.sampleRate,
    waveLength = samples * nChannels * 2 + 44,
    waveBuffer = new ArrayBuffer(waveLength),
    view = new DataView(waveBuffer),
    channelData = [];

  let offset = 0, viewPos = 0;

  // write WAVE header
  viewPos = setUint32(view, 0x46464952, viewPos); // "RIFF"
  viewPos = setUint32(view, waveLength - 8, viewPos); // file waveLength - 8
  viewPos = setUint32(view, 0x45564157, viewPos); // "WAVE"

  viewPos = setUint32(view, 0x20746d66, viewPos); // "fmt " chunk
  viewPos = setUint32(view, 16, viewPos); // waveLength = 16
  viewPos = setUint16(view, 1, viewPos); // PCM (uncompressed)
  viewPos = setUint16(view, nChannels, viewPos);
  viewPos = setUint32(view, sampleRate, viewPos);
  viewPos = setUint32(view, sampleRate * 2 * nChannels, viewPos); // avg. bytes/sec
  viewPos = setUint16(view, nChannels * 2, viewPos); // block-align
  viewPos = setUint16(view, 16, viewPos); // 16-bit (hardcoded in this demo)

  viewPos = setUint32(view, 0x61746164, viewPos); // "data" - chunk
  viewPos = setUint32(view, waveLength - viewPos - 4, viewPos); // chunk waveLength

  // write interleaved data
  for (let i = 0; i < nChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  while (viewPos < waveLength) {
    for (let i = 0; i < nChannels; i++) {
      // interleave channelData
      let sample = Math.max(-1, Math.min(1, channelData[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(viewPos, sample, true); // write 16-bit sample
      viewPos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  let waveBlob = new Blob([waveBuffer], { type: "audio/wav" });
  if (ext) {
    return new Blob([waveBlob], { type: "audio/" + (ext || "wav") });
  }
  else return waveBlob;
}

function setUint16(view, data, viewPos) {
  view.setUint16(viewPos, data, true);
  viewPos += 2;
  return viewPos;
}

function setUint32(view, data, viewPos) {
  view.setUint32(viewPos, data, true);
  viewPos += 4;
  return viewPos;
}