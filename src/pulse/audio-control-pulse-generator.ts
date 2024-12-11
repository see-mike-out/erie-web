import { ToneSeries, ToneOverlaySeries } from "../player/audio-graph-player";
import { AudioContext } from 'standardized-audio-context';
import { RampType } from "../types";

const channels = 2;
// TODO
export async function generatePCMCode(queue) {
  // currently only support sine wave
  // this is an experimental feature. currently only works for non-overlaid tone-series queues.
  // queue: a discrete or continous queue data
  // supported channels: time, pitch, loudness, pan
  let ctx = new AudioContext();
  let sampleRate = ctx.sampleRate;
  let queues = [];
  if (queue.type === ToneSeries) {
    queues.push(queue)
  } else if (queue.type === ToneOverlaySeries) {
    queues.push(...queue.overlays);
  }
  let queue_lengths = queues.map((q) => Math.max(...q.sounds.map((d) => d.time + d.duration + (d.postReverb || 0))));
  let length = Math.max(...queue_lengths);
  let frameCount = sampleRate * length;
  let buffer = ctx.createBuffer(channels, frameCount, sampleRate);
  let channel0 = buffer.getChannelData(0);
  let channel1 = buffer.getChannelData(1);


  for (let i = 0; i < frameCount; i++) {
    channel0[i] = 0;
    channel1[i] = 0;
  }
  for (const queue of queues) {
    let sounds = queue.sounds;
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
          channel0[f + i] += data[i] * gain * LRgain[0];
          channel1[f + i] += data[i] * gain * LRgain[1];
        }
      }
    } else {
      // continous sound
      let ramp_pan = getRampFunction(queue.ramp?.pan),
        ramp_gain = getRampFunction(queue.ramp?.loudness);
      if (ramp_pan instanceof Function && ramp_gain instanceof Function) {
        sounds.sort((a, b) => a.time - b.time);
        let acc_prev = 0;
        for (let i = 0; i < sounds.length - 1; i++) {
          let sound = sounds[i], next_sound = sounds[i + 1];
          let f = Math.round(sound.time * sampleRate),
            t = Math.round(next_sound.time * sampleRate);
          let length = t - f;

          let pcm_pop = populatePCMforFreqRamp(sound.pitch, next_sound.pitch, queue.ramp?.pitch, acc_prev, length, sampleRate);
          if (pcm_pop) {
            let data = pcm_pop?.data, acc = pcm_pop?.acc;
            acc_prev = acc;

            let f_gain = sound.loudness;
            if (f_gain === undefined) f_gain = 1;
            let f_pan = sound.pan;
            if (f_pan === undefined) f_pan = 0;

            let t_gain = sound.loudness;
            if (t_gain === undefined) t_gain = 1;
            let t_pan = sound.pan;
            if (t_pan === undefined) t_pan = 0;

            for (let j = 0; j < length; j++) {
              let rpi = data[j];
              let rga = ramp_gain(f_gain, t_gain, j / length)
              let rpa = ramp_pan(f_pan, t_pan, j / length);
              let LRgain = getLRgain(rpa);
              channel0[f + j] += rpi * rga * LRgain[0];
              channel1[f + j] += rpi * rga * LRgain[1];
            }
          }
        }
      }
    }
  }
  return buffer;
}

function populatePCMforFreq(pitch: number, frameCount: number, sampleRate: number): Float32Array {
  let data = new Float32Array(frameCount);
  let cycle = pitch == 0 ? 0 : sampleRate / pitch;
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.sin(2 * Math.PI / cycle * i);
  }
  return data
}

function populatePCMforFreqRamp(pitch_from: number,
  pitch_to: number,
  ramp: RampType | undefined,
  acc: number,
  frameCount: number,
  sampleRate: number): { data: Float32Array, acc: number } | void {
  if (ramp === "abrupt" || ramp === false) {
    return { data: populatePCMforFreq(pitch_from, frameCount, sampleRate), acc: 0 };
  } else if (ramp === "linear" || ramp === true || ramp === undefined) {
    let data = new Float32Array(frameCount);
    let cycle_from = pitch_from == 0 ? 0 : sampleRate / pitch_from, cycle_to = pitch_to == 0 ? 0 : sampleRate / pitch_to;
    let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
      return cycle_from + ((cycle_to - cycle_from) / (frameCount - 1) * i);
    });
    for (let i = 0; i < frameCount; i++) {
      acc += 2 * Math.PI / cycles[i];
      if (Math.sin(acc) == 0) acc = 0;
      data[i] = Math.sin(acc);
    }
    return { data, acc };
  } else if (ramp === "exponential") {
    let data = new Float32Array(frameCount);
    let cycle_from = sampleRate / pitch_from, cycle_to = sampleRate / pitch_to;
    let cycles = Array(frameCount).fill(cycle_from).map((_, i) => {
      return (cycle_to - cycle_from) * Math.exp(i / frameCount) + cycle_from
    });
    for (let i = 0; i < frameCount; i++) {
      acc += 2 * Math.PI / cycles[i];
      if (Math.sin(acc) == 0) acc = 0;
      data[i] = Math.sin(acc);
    }
    return { data, acc };
  }
}

function getLRgain(pan: number): [number, number] {
  let panp = Math.PI * (pan + 1) / 4;
  return [Math.cos(panp), Math.sin(panp)];
}

function getRampFunction(ramp: RampType | undefined): void | ((a: number, b: number, r: number) => number) {
  if (ramp === "linear" || ramp === true || ramp === undefined) {
    return (a: number, b: number, r: number) => { return a * (1 - r) + b * r };
  } else if (ramp === "abrupt" || ramp === false) {
    return (a: number, _: any, __: any) => { return a };
  } else if (ramp === "exponential") {
    return (a: number, b: number, r: number) => {
      return (b - a) * Math.exp(r) + a
    };
  } else {
    console.error("Unsupported Ramp Method.");
  }
}