import { determineNoteRange, MultiNoteInstruments, SingleNoteInstruments } from './audio-graph-instrument-sample';
import { notifyStop } from '../util/audio-graph-speech';
import { makeTick } from '../tick/audio-graph-time-tick';
import { deepcopy, genRid } from '../util/audio-graph-util';
import { AM, ErieSynth, FM, makeSynth } from './audio-graph-synth';
import { makeNoiseNode, NoiseTypes } from './audio-graph-noise';
import { PresetFilters } from './audio-graph-audio-filter';
import { TAPSPD_chn, TAPCNT_chn } from '../scale/audio-graph-scale-constant';
import { sendSpeechFinishEvent, sendSpeechStartEvent, sendToneFinishEvent, sendToneStartEvent } from './audio-graph-player-event';
import { ErieFilters } from '../classes/erie-audio-filter';
import { emitNotePlayEvent, emitNoteStopEvent } from "./audio-graph-note-event";

let ErieGlobalSynth;

export function makeContext() {
  return new AudioContext();
}

export function setCurrentTime(ctx) {
  return ctx.currentTime;
}

export function makeInstrument(ctx, detail, instSamples, synthDefs, waveDefs, sound, contEndTime) {
  if (!detail || detail === "default") {
    return ctx.createOscillator();
  } else if (NoiseTypes.includes(detail)) {
    let dur = contEndTime || sound.duration;
    if (sound.detune > 0) dur += dur * (sound.detune / 600);
    return makeNoiseNode(ctx, detail, dur * 1.1);
  } else if (MultiNoteInstruments.includes(detail)) {
    let note = determineNoteRange(sound.pitch || DefaultFrequency, {});
    let sample = instSamples[detail]['C' + note.octave];
    let source = ctx.createBufferSource();
    source.buffer = sample;
    source.detune.value = note.detune;
    return source;
  } else if (SingleNoteInstruments.includes(detail)) {
    let sample = instSamples[detail].mono;
    let source = ctx.createBufferSource();
    source.buffer = sample;
    return source;
  } else if (Object.keys(waveDefs || {})?.includes(detail)) {
    let real_parsed = new Float32Array(waveDefs[detail].real);
    let imag_parsed = new Float32Array(waveDefs[detail].imag);
    const wave = ctx.createPeriodicWave(
      real_parsed,
      imag_parsed,
      { disableNormalization: waveDefs[detail].disableNormalization || false });
    let osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    return osc;
  } else if (Object.keys(instSamples || {})?.includes(detail)) {
    let sample;
    if (instSamples[detail].multiNote) {
      let note = determineNoteRange(sound.pitch, {});
      sample = instSamples[detail]['C' + note?.octave];
    } else {
      sample = instSamples[detail].mono;
    }
    let source = ctx.createBufferSource();
    source.buffer = sample;
    if (instSamples[detail].multiNote) {
      source.detune.value = note.detune;
    }
    return source;
  } else if (Object.keys(synthDefs || {})?.includes(detail)) {
    let synth = makeSynth(ctx, synthDefs[detail]);
    return synth;
  }
}

export const DefaultFrequency = 523.25;
export const Stopped = 'stopped',
  Playing = 'playing',
  MultiPlaying = 'milti-playing',
  Tone = 'tone',
  Speech = 'speech';
export let ErieGlobalControl, ErieGlobalState;

const RamperNames = {
  abrupt: 'setValueAtTime',
  linear: 'linearRampToValueAtTime',
  linear: 'exponentialRampToValueAtTime'
}

export async function playAbsoluteDiscreteTonesAlt(ctx, queue, config, instSamples, synthDefs, waveDefs, filters) {
  // clear previous state
  ErieGlobalState = undefined;

  // playing a series of discrete tones with an aboslute schedule
  // set audio context controls
  ErieGlobalControl = { type: Tone, player: ctx };
  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.value = 0;

  // sort queue to mark the last node for sequence end check
  let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
  q[0].isFirst = true;
  q[q.length - 1].isLast = true;
  config.subpart = true;
  let endTime = q[q.length - 1].time + q[q.length - 1].duration;
  // play as async promise
  let sid = genRid();
  sendToneStartEvent({ sid });
  if (config?.isRecorded) await playPause(300);
  return new Promise((resolve, reject) => {
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);

    const tick = makeTick(ctx, config.tick, endTime);

    // set and play sounds
    for (let sound of q) {
      if (ErieGlobalState === Stopped) {
        resolve();
        break;
      }
      // get discrete oscillator
      const inst = makeInstrument(ctx);
      inst.connect(gain);

      // play & stop
      inst.start(ct + sound.time);
      inst.stop(ct + sound.time + 0.01);

      // play the sound
      inst.onended = async () => {
        if (config?.falseTiming && ErieGlobalControl?.type === Speech) {
          ErieGlobalControl?.player?.cancel();
        }
        await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters);
        if (sound.isLast) {
          if (config?.isRecorded) await playPause(300);
          sendToneFinishEvent({ sid });
          resolve();
        }
      };
    }
    if (tick) {
      tick.start(ct + 0.01);
      tick.stop(ct + endTime + 0.01);
    }
  });
}

export async function playAbsoluteContinuousTones(ctx, queue, config, synthDefs, waveDefs, filters) {
  // clear previous state
  ErieGlobalState = undefined;

  // set audio context controls
  ErieGlobalControl = { type: Tone, player: ctx };

  // rampers 
  let rampers = {};
  if (config.ramp) {
    Object.keys(config.ramp || {}).forEach((chn) => {
      let name = RamperNames[config.ramp[chn]];
      if (chn === TAPCNT_chn || chn === TAPSPD_chn) {
        rampers.tap = name;
      } else {
        rampers[chn] = name;
      }
    });
  }

  // sort queue to mark the last node for sequence end check
  let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
  q[0].isFirst = true;
  q[q.length - 1].isLast = true;

  // get the last tone's finish time
  let endTime = q[q.length - 1].time + q[q.length - 1].duration;

  // filters
  let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
  for (const filterName of filters) {
    if (PresetFilters[filterName]) {
      filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
      filterEncoders[filterName] = PresetFilters[filterName].encoder;
      filterFinishers[filterName] = PresetFilters[filterName].finisher
    } else if (ErieFilters[filterName]) {
      filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
      filterEncoders[filterName] = ErieFilters[filterName].encoder;
      filterFinishers[filterName] = ErieFilters[filterName].finisher
    }
  }
  let destination = ctx.destination;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ctx.currentTime, endTime);
      destination = filter.destination;
    }
  }

  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);
  // streo panner == pan
  const panner = ctx.createStereoPanner();
  panner.connect(gain);

  let sid = genRid()
  sendToneStartEvent({ sid });
  if (config?.isRecorded) await playPause(300);
  // play as async promise
  return new Promise((resolve, reject) => {
    // get instrument
    const inst = makeInstrument(ctx, config?.instrument_type, null, synthDefs, waveDefs, null, endTime);
    inst.connect(panner);
    let startTime;
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    for (let sound of q) {
      if (sound.isFirst) {
        // set for the first value
        if (inst?.constructor.name === OscillatorNode.name) {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
        } else if (inst?.constructor.name === ErieSynth.name) {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          if (inst.type === FM && sound.modulation !== undefined) {
            inst.modulator.frequency.setValueAtTime((inst.modulatorVolume / sound.modulation), ct + sound.time);
          } else if (inst.type === AM && sound.modulation !== undefined) {
            inst.modulatorGain.gain.setValueAtTime((sound.loudness || 1) * sound.modulation, ct + sound.time);
          }
          if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
            inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
          }
          inst.envelope.gain.cancelScheduledValues(ct + sound.time);
          inst.envelope.gain.setValueAtTime(0, ct + sound.time);
          inst.envelope.gain.linearRampToValueAtTime(1, ct + sound.time + (inst.attackTime || 0));
          if (inst.decayTime) {
            inst.envelope.gain.linearRampToValueAtTime(inst.sustain || 1, ct + sound.time + (inst.attackTime || 0) + (inst.decayTime || 0));
          }
        }

        if (sound.detune && inst.detune) {
          inst.detune.setValueAtTime(sound.detune || 0, ct + sound.time);
        }

        if (sound.loudness !== undefined) {
          gain.gain.setValueAtTime(sound.loudness, ct + sound.time);
        }
        if (sound.pan !== undefined) {
          panner.pan.setTargetAtTime(sound.pan, ct + sound.time, 0.35);
        }
        // play the first
        startTime = ct + sound.time;
      } else {
        if (inst?.constructor.name === OscillatorNode.name) {
          if (rampers.pitch) {
            inst.frequency[rampers.pitch](sound.pitch || DefaultFrequency, ct + sound.time);
          } else {
            inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          }
        } else if (inst?.constructor.name === ErieSynth.name) {
          if (rampers.pitch) {
            inst.frequency[rampers.pitch](sound.pitch || DefaultFrequency, ct + sound.time);
          } else {
            inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          }
          if (inst.type === FM && sound.modulation !== undefined) {
            if (rampers.modulation) {
              inst.modulator.frequency[rampers.modulation]((inst.modulatorVolume / sound.modulation), ct + sound.time);
            } else {
              inst.modulator.frequency.linearRampToValueAtTime((inst.modulatorVolume / sound.modulation), ct + sound.time);
            }
          } else if (inst.type === AM && sound.modulation !== undefined) {
            if (rampers.modulation) {
              inst.modulatorGain.gain[rampers.modulation]((sound.loudness || 1) * sound.modulation, ct + sound.time);
            } else {
              inst.modulatorGain.gain.linearRampToValueAtTime((sound.loudness || 1) * sound.modulation, ct + sound.time);
            }
          }
          if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
            if (rampers.harmonicity) {
              inst.modulator.frequency[rampers.harmonicity]((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
            } else {
              inst.modulator.frequency.linearRampToValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct + sound.time);
            }
          }
        }

        if (sound.loudness !== undefined) {
          if (rampers.loudness) {
            gain.gain[rampers.loudness](
              sound.loudness <= 0 ? 0.0000000001 : sound.loudness,
              ct + sound.time
            );
          } else {
            gain.gain.linearRampToValueAtTime(
              sound.loudness,
              ct + sound.time
            );
          }
        }
        if (sound.pan !== undefined) {
          panner.pan.linearRampToValueAtTime(sound.pan, ct + sound.time);
        }
        if (sound.isLast) {
          gain.gain.linearRampToValueAtTime(0, ct + sound.time + 0.15);
          if (inst?.constructor.name === ErieSynth.name) {
            inst.envelope.gain.cancelScheduledValues(ct + sound.time);
            inst.envelope.gain.setValueAtTime(1, ct + sound.time + (sound.duration));
            inst.envelope.gain.linearRampToValueAtTime(
              0,
              ct + sound.time + (sound.duration || 0) + (inst.attackTime || 0) + (inst.releaseTime || 0)
            );
          }
        }

        if (sound.detune && inst.detune) {
          if (rampers.detune) {
            inst.detune[rampers.detune](sound.detune || 0, ct + sound.time);
          } else {
            inst.detune.linearRampToValueAtTime(sound.detune || 0, ct + sound.time);
          }
        }
      }

      for (const filterName of filters) {
        let encoder = filterEncoders[filterName];
        let finisher = filterFinishers[filterName];
        if (encoder) {
          encoder(filterNodes[filterName], sound, ct + sound.time, rampers);
        }
        if (finisher) {
          finisher(filterNodes[filterName], sound, ct + sound.time, (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)), rampers);
        }
      }
    }

    const tick = makeTick(ctx, config.tick, endTime);
    if (tick) {
      tick.start(startTime);
      tick.stop(ct + endTime);
    }

    emitNotePlayEvent('tone', q[0]);
    inst.start(startTime);
    if (config?.isRecorded) {
      gain.gain.setValueAtTime(0, ct + endTime + 0.3);
      inst.stop(ct + endTime + 0.3);
    } else {
      inst.stop(ct + endTime);
    }
    inst.onended = (e) => {
      ErieGlobalControl = undefined;
      ErieGlobalState = undefined;
      emitNoteStopEvent('tone', q[0]);
      sendToneFinishEvent({ sid });
      resolve();
    };
  });
}

export async function playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters) {
  if (config?.subpart && ErieGlobalState === Stopped) return;
  if (!config?.subpart) ErieGlobalState = undefined;

  // clear previous state
  ErieGlobalState = undefined;

  // set audio context controls
  ErieGlobalControl = { type: Tone, player: ctx };

  let sid;
  if (!config.subpart) {
    sid = genRid()
    sendToneStartEvent({ sid });
    if (config?.isRecorded) await playPause(300);
  }

  if (sound.tap !== undefined && sound.tap?.pattern?.constructor.name === "Array") {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    let tapSound = deepcopy(sound);
    let t = 1, acc = 0, i = 0; // d
    if (sound.tap.pattern.length == 0) {
      await playPause((sound.duration || 0.2) * 1000);
      if (config?.isRecorded) await playPause(300);
      sendToneFinishEvent({ sid });
    }

    emitNotePlayEvent('tone', sound);
    for (const s of sound.tap.pattern) {
      if (t === 1) {
        tapSound.duration = s;
        if (s > 0) {
          await __playSingleTone(ctx, ct + acc, tapSound, config, instSamples, synthDefs, waveDefs, filters);
        }
        t = 0;
      } else {
        await playPause(s * 1000);
        t = 1;
      }
      acc += s;
      i++;
      if (i == sound.tap.pattern.length) {
        // ErieGlobalControl = undefined;
        // ErieGlobalState = undefined;
        if (!config.subpart) {
          if (config?.isRecorded) await playPause(300);
          sendToneFinishEvent({ sid });
        }
        return;
      }
    }
    emitNoteStopEvent('tone', sound);
  } else {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    emitNotePlayEvent('tone', sound);
    await __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters);
    emitNoteStopEvent('tone', sound);
    // ErieGlobalControl = undefined;
    // ErieGlobalState = undefined;
    if (!config.subpart) {
      sendToneFinishEvent({ sid });
    }
    return;
  }
}

async function __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters) {
  // filters
  let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
  for (const filterName of filters) {
    if (PresetFilters[filterName]) {
      filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
      filterEncoders[filterName] = PresetFilters[filterName].encoder;
      filterFinishers[filterName] = PresetFilters[filterName].finisher
    } else if (ErieFilters[filterName]) {
      filterNodes[filterName] = new ErieFilters[filterName].filter(ctx);
      filterEncoders[filterName] = ErieFilters[filterName].encoder;
      filterFinishers[filterName] = ErieFilters[filterName].finisher
    }
  }
  let destination = ctx.destination;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ct, sound.duration);
      destination = filter.destination;
    }
  }
  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);
  // streo panner == pan
  const panner = ctx.createStereoPanner();
  panner.connect(gain);

  // play as async promise
  return new Promise((resolve, reject) => {
    // get the current time
    // get discrete oscillator
    let iType = sound.timbre || config?.instrument_type
    const inst = makeInstrument(ctx, iType, instSamples, synthDefs, waveDefs, sound);

    inst.connect(panner);

    // set auditory values
    if (inst?.constructor.name === OscillatorNode.name) {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
    } else if (inst?.constructor.name === ErieSynth.name) {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
      if (inst.type === FM && sound.modulation !== undefined && sound.modulation > 0) {
        inst.modulator.frequency.setValueAtTime((inst.modulatorVolume / sound.modulation), ct);
      } else if (inst.type === AM && sound.modulation !== undefined && sound.modulation > 0) {
        inst.modulatorGain.gain.setValueAtTime((sound.loudness || 1) * sound.modulation, ct);
      }
      if (sound.harmonicity !== undefined && sound.harmonicity > 0) {
        inst.modulator.frequency.cancelScheduledValues(ct);
        inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * sound.harmonicity, ct);
      }

      inst.envelope.gain.cancelScheduledValues(ct);
      inst.envelope.gain.setValueAtTime(0, ct);
      inst.envelope.gain.linearRampToValueAtTime(1, ct + (inst.attackTime || 0));
      if (inst.decayTime) {
        inst.envelope.gain.linearRampToValueAtTime(inst.sustain || 1, ct + sound.time + (inst.attackTime || 0) + (inst.decayTime || 0));
      }
      inst.envelope.gain.setValueAtTime(inst.sustain || 1, ct + (sound.duration));
      inst.envelope.gain.linearRampToValueAtTime(
        0,
        ct + (sound.duration) + (inst.attackTime || 0) + (inst.releaseTime || 0)
      );
    }

    if (sound.detune && inst.detune) {
      inst.detune.setValueAtTime(sound.detune || 0, ct);
    }

    if (sound.loudness !== undefined) {
      gain.gain.setValueAtTime(sound.loudness, ct);
    }
    if (sound.postReverb) {
      gain.gain.setTargetAtTime(0, ct + (sound.duration) * 0.95, 0.015);
      gain.gain.setTargetAtTime(0.45, ct + (sound.duration), 0.015);
      gain.gain.exponentialRampToValueAtTime(0.02, ct + (sound.duration + sound.postReverb) * 0.95);
    } else {
      sound.postReverb = 0;
    }

    for (const filterName of filters) {
      let encoder = filterEncoders[filterName];
      let finisher = filterFinishers[filterName];
      if (encoder) {
        encoder(filterNodes[filterName], sound, ct);
      }
      if (finisher) {
        finisher(filterNodes[filterName], sound, ct + sound.time, ct + (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)));
      }
    }

    gain.gain.setTargetAtTime(0, ct + (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)) * 0.95, 0.015);

    if (sound.pan !== undefined) {
      panner.pan.setValueAtTime(sound.pan, ct);
    }

    // check the last
    inst.onended = (e) => {
      resolve();
    };

    // play & stop
    inst.start(ct);
    inst.stop(ct + sound.duration + sound.postReverb);
  });
}


export async function playSingleSpeech(sound, config) {
  // clear previous state
  if (config?.subpart && ErieGlobalState === Stopped) return;
  if (!config?.subpart) ErieGlobalState = undefined;

  let sid = genRid();
  if (!config.subpart) {
    sendSpeechStartEvent({ sound, sid });
  }
  return new Promise((resolve, reject) => {
    if (!ErieGlobalSynth) ErieGlobalSynth = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance(sound.speech);
    if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
    else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
    if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
    if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
    if (sound?.language) utterance.lang = bcp47language.includes(sound.language) ? sound.language : document?.documentElement?.lang;
    else utterance.lang = document.documentElement.lang;
    emitNotePlayEvent('speech', sound);
    ErieGlobalSynth.speak(utterance);
    ErieGlobalControl = { type: Speech, player: ErieGlobalSynth };
    utterance.onend = () => {
      window.removeEventListener('keypress', stop);
      ErieGlobalControl = undefined;
      ErieGlobalState = undefined;
      emitNoteStopEvent('speech', sound);
      if (!config.subpart) {
        sendSpeechFinishEvent({ sid });
      }
      resolve();
    };
  });
}

export async function playRelativeDiscreteTonesAndSpeeches(ctx, queue, _config, instSamples, synthDefs, waveDefs, filters) {
  // clear previous state
  ErieGlobalState = undefined;

  let config = deepcopy(_config);
  config.subpart = true;
  for (const sound of queue) {
    if (ErieGlobalState === Stopped) break;
    let sid = genRid();
    if (sound.speech) {
      sendSpeechStartEvent({ sound, sid });
      await playSingleSpeech(sound, config);
      sendSpeechFinishEvent({ sid });
    } else {
      sendToneStartEvent({ sid });
      if (config?.isRecorded) await playPause(300);
      await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters);
      if (config?.isRecorded) await playPause(300);
      sendToneFinishEvent({ sid });
    }
  }
  ErieGlobalState = undefined;
  return;
}

export async function playAbsoluteSpeeches(ctx, queue, config) {
  // clear previous state
  ErieGlobalState = undefined;

  // playing a series of discrete tones with an aboslute schedule
  // set audio context controls
  ErieGlobalControl = { type: Tone, player: ctx };
  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.value = 0;

  // sort queue to mark the last node for sequence end check
  let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
  q[0].isFirst = true;
  q[q.length - 1].isLast = true;
  config.subpart = true;
  // play as async promise
  return new Promise((resolve, reject) => {
    // get the current time
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);

    // set and play sounds
    let prev;
    for (let sound of q) {
      if (ErieGlobalState === Stopped) {
        resolve();
        break;
      }
      let d = 0;
      if (prev) {
        d = q.time - (prev.ime + prev.duration);
      }
      // get discrete oscillator
      const inst = makeInstrument(ctx);
      inst.connect(gain);

      // play & stop
      inst.start(ct + sound.time - 0.02);
      inst.stop(ct + sound.time);

      // play the sound
      inst.onended = () => {
        if (config?.falseTiming && ErieGlobalControl?.type === Speech) {
          ErieGlobalControl?.player?.cancel();
        }
        playSingleSpeech(sound, config);
        if (sound.isLast) {
          resolve();
        }
      };
      prev = q;
    }
  });
}

export let ErieGlobalPlayerEvents = new Map();
export function setPlayerEvents(queue, config) {
  if (typeof window !== 'undefined') {
    function stop(event) {
      if (event.key == 'x') {
        ErieGlobalState = Stopped;
        queue.state = Stopped;
        if (ErieGlobalControl?.type === Tone) {
          ErieGlobalControl.player.close();
        } else if (ErieGlobalControl?.type === Speech) {
          ErieGlobalControl.player.cancel();
        }
        notifyStop(config);
      }
    }
    window.addEventListener('keypress', stop);
    ErieGlobalPlayerEvents.set('stop-event', stop);
  }
}

export function clearPlayerEvents() {
  if (typeof window !== 'undefined') {
    let stop = ErieGlobalPlayerEvents.get('stop-event');
    window.removeEventListener('keypress', stop);
    ErieGlobalPlayerEvents.delete('stop-event');
  }
}

export function playPause(ms, config) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}

const bcp47language = [
  "ar-SA",
  "bn-BD",
  "bn-IN",
  "cs-CZ",
  "da-DK",
  "de-AT",
  "de-CH",
  "de-DE",
  "el-GR",
  "en-AU",
  "en-CA",
  "en-GB",
  "en-IE",
  "en-IN",
  "en-NZ",
  "en-US",
  "en-ZA",
  "es-AR",
  "es-CL",
  "es-CO",
  "es-ES",
  "es-MX",
  "es-US",
  "fi-FI",
  "fr-BE",
  "fr-CA",
  "fr-CH",
  "fr-FR",
  "he-IL",
  "hi-IN",
  "hu-HU",
  "id-ID",
  "it-CH",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "nl-BE",
  "nl-NL",
  "no-NO",
  "pl-PL",
  "pt-BR",
  "pt-PT",
  "ro-RO",
  "ru-RU",
  "sk-SK",
  "sv-SE",
  "ta-IN",
  "ta-LK",
  "th-TH",
  "tr-TR",
  "zh-CN",
  "zh-HK",
  "zh-TW"
];