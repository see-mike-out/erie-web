const channels = 2;
export async function generatePCMCode(queue) {
  // currently only support sine wave
  // this is an experimental feature. currently only works for non-overlaid tone-series queues.
  // todo: overlay
  // ctx: an audio context
  // queue: a discrete or continous queue data
  // supported channels: time, pitch, loudness, pan
  let ctx = new AudioContext();
  let sampleRate = ctx.sampleRate;
  let sounds = queue.sounds;
  let length = Math.max(...sounds.map((d) => d.time + d.duration + (d.postReverb || 0)));
  let frameCount = sampleRate * length;
  let buffer = ctx.createBuffer(channels, frameCount, sampleRate);
  let channel0 = buffer.getChannelData(0);
  let channel1 = buffer.getChannelData(1);
  for (let i = 0; i < frameCount; i++) {
    channel0[i] = 0;
    channel1[i] = 0;
  }
  if (!queue.continued) {
    // discrete sounds
    for (const sound of sounds) {
      let f = sound.time * sampleRate,
        t = (sound.time + sound.duration + sound.postReverb) * sampleRate;
      let length = t - f;
      let data = populatePCMforFreq(sound.pitch, length, sampleRate);
      let gain = sound.loudness;
      if (gain === undefined) gain = 1;
      let pan = sound.pan;
      if (pan === undefined) pan = 0;
      let LRgain = getLRgain(pan);
      for (let i = 0; i < length; i++) {
        channel0[f + i] = data[i] * gain * LRgain[0];
        channel1[f + i] = data[i] * gain * LRgain[1];
      }
    }
  } else {
    // continous sound
    // not so smooth..
    let ramp_pitch = getRampFunction(queue.ramp.pitch),
      ramp_pan = getRampFunction(queue.ramp.pan),
      ramp_gain = getRampFunction(queue.ramp.loudness);
    sounds.sort((a, b) => a.time - b.time);
    for (let i = 0; i < sounds.length - 1; i++) {
      let sound = sounds[i], next_sound = sounds[i + 1];
      let f = Math.round(sound.time * sampleRate),
        t = Math.round(next_sound.time * sampleRate);
      let length = t - f;

      let f_data = populatePCMforFreq(sound.pitch, length, sampleRate);
      let f_gain = sound.loudness;
      if (f_gain === undefined) f_gain = 1;
      let f_pan = sound.pan;
      if (f_pan === undefined) f_pan = 0;

      let t_data = populatePCMforFreq(next_sound.pitch, length, sampleRate);
      let t_gain = sound.loudness;
      if (t_gain === undefined) t_gain = 1;
      let t_pan = sound.pan;
      if (t_pan === undefined) t_pan = 0;

      for (let i = 0; i < length; i++) {
        let rpi = ramp_pitch(f_data[i], t_data[i], i / length);
        let rga = ramp_gain(f_gain, t_gain, i / length)
        let rpa = ramp_pan(f_pan, t_pan, i / length);
        let LRgain = getLRgain(rpa);
        channel0[f + i] = rpi * rga * LRgain[0];
        channel1[f + i] = rpi * rga * LRgain[1];
      }
    }
  }
  return buffer;
}

function populatePCMforFreq(pitch, frameCount, sampleRate) {
  let data = new Float32Array(frameCount);
  let cycle = sampleRate / pitch;
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.sin(Math.PI / cycle * i);
  }
  return data
}

function getLRgain(pan) {
  let panp = Math.PI * (pan + 1) / 4;
  return [Math.cos(panp), Math.sin(panp)];
}

function getRampFunction(m) {
  if (m === "linear" || !m) {
    return (a, b, r) => { return a * (1 - r) + b * r };
  } else if (m === "abrupt") {
    return (a, b, r) => { return a };
  } else if (m === "exp") {
    return (a, b, r) => {
      return (b - a) * Math.exp(r) + a
    };
  }
}