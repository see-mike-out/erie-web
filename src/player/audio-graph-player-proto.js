import { browser } from '$app/environment';
import { determineNoteRange, MultiNoteInstruments, SingleNoteInstruments } from './audio-graph-instrument-sample';
import { notifyStop } from '../util/audio-graph-speech';
import { makeTick } from '../tick/audio-graph-time-tick';
import { deepcopy } from '../util/audio-graph-util';
import { AM, FM, makeSynth } from './audio-graph-synth';
import { makeNoiseNode, NoiseTypes } from './audio-graph-noise';
import { PresetFilters } from './audio-graph-audio-filter';

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
    let note = determineNoteRange(sound.pitch, {});
    let sample = instSamples[detail]['C' + note.octave];
    let source = ctx.createBufferSource();
    source.buffer = sample;
    source.detune.value = note.detune;
    return source;
  } else if (SingleNoteInstruments.includes(detail)) {
    let sample = instSamples[detail]['C3'];
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
      sample = instSamples[detail]['C' + note.octave];
    } else {
      sample = instSamples[detail]['C3'];
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
          ErieGlobalControl?.player?.disconnectf();
        }
        // let _sound = deepcopy(sound);
        // _sound.time = 0;
        // let nctx = makeContext()
        await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters);
        // ctx.close();
        if (sound.isLast) {
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

  // filters
  let filterEncoders = {}, filterFinishers = {}, filterNodes = {};
  for (const filterName of filters) {
    if (PresetFilters[filterName]) {
      filterNodes[filterName] = new PresetFilters[filterName].filter(ctx);
      filterEncoders[filterName] = PresetFilters[filterName].encoder;
      filterFinishers[filterName] = PresetFilters[filterName].finisher
    } else if (registeredFilters[filterName]) {
      filterNodes[filterName] = new registeredFilters[filterName].filter(ctx);
      filterEncoders[filterName] = registeredFilters[filterName].encoder;
      filterFinishers[filterName] = registeredFilters[filterName].finisher
    }
  }
  let destination = ctx.destination;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ct);
      destination = filter.destination;
    }
  }

  // gain == loudness
  const gain = ctx.createGain();
  gain.connect(destination);
  // streo panner == pan
  const panner = ctx.createStereoPanner();
  panner.connect(gain);

  // sort queue to mark the last node for sequence end check
  let q = queue.sort((a, b) => a.time + a.duration - (b.time + b.duration));
  q[0].isFirst = true;
  q[q.length - 1].isLast = true;

  // get the last tone's finish time
  let endTime = q[q.length - 1].time + q[q.length - 1].duration;

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
        if (inst?.constructor.name === "OscillatorNode") {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
        } else if (inst?.constructor.name === "ErieSynth") {
          inst.frequency.setValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          if (inst.type === FM && sound.modulation !== undefined) {
            inst.modulator.frequency.setValueAtTime((sound.modulation * inst.modulatorVolume), ct + sound.time);
          } else if (inst.type === AM && sound.harmonicity !== undefined) {
            inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * inst.harmonicity, ct + sound.time);
          }
          inst.envelope.gain.cancelScheduledValues(ct + sound.time);
          inst.envelope.gain.setValueAtTime(0, ct + sound.time);
          inst.envelope.gain.linearRampToValueAtTime(1, ct + sound.time + (inst.attackTime || 0));
          if (inst.decayTime) {
            inst.envelope.gain.linearRampToValueAtTime(inst.sustain || 1, ct + sound.time + (inst.attackTime || 0) + (inst.decayTime || 0));
          }
        }

        if (sound.detune && NoiseTypes.includes(iType)) {
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
        if (inst?.constructor.name === "OscillatorNode") {
          inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
        } else if (inst?.constructor.name === "ErieSynth") {
          inst.frequency.linearRampToValueAtTime(sound.pitch || DefaultFrequency, ct + sound.time);
          if (inst.type === FM && sound.modulation !== undefined) {
            inst.modulator.frequency.linearRampToValueAtTime((sound.modulation * inst.modulatorVolume), ct + sound.time);
          } else if (inst.type === AM && sound.harmonicity !== undefined) {
            inst.modulator.frequency.linearRampToValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * inst.harmonicity, ct + sound.time);
          }
        }

        if (sound.loudness !== undefined) {
          gain.gain.linearRampToValueAtTime(
            sound.loudness <= 0 ? 0.0000000001 : sound.loudness,
            ct + sound.time
          );
        }
        if (sound.pan !== undefined) {
          panner.pan.linearRampToValueAtTime(sound.pan, ct + sound.time);
        }
        if (sound.isLast) {
          gain.gain.linearRampToValueAtTime(0, ct + sound.time + 0.15);
          if (inst?.constructor.name === "ErieSynth") {
            inst.envelope.gain.cancelScheduledValues(ct + sound.time);
            inst.envelope.gain.setValueAtTime(1, ct + sound.time + (sound.duration));
            inst.envelope.gain.linearRampToValueAtTime(
              0,
              ct + sound.time + (sound.duration || 0) + (inst.attackTime || 0) + (inst.releaseTime || 0)
            );
          }
        }

        if (sound.detune && NoiseTypes.includes(iType)) {
          inst.detune.linearRampToValueAtTime(sound.detune || 0, ct + sound.time);
        }
      }

      for (const filterName of filters) {
        let encoder = filterEncoders[filterName];
        let finisher = filterFinishers[filterName];
        if (encoder) {
          encoder(filterNodes[filterName], sound, ct + sound.time);
        }
        if (finisher) {
          finisher(filterNodes[filterName], sound, ct + sound.time, (sound.duration + sound.postReverb + (inst.attackTime || 0) + (inst.releaseTime || 0)));
        }
      }
    }

    const tick = makeTick(ctx, config.tick, endTime);
    if (tick) {
      tick.start(startTime);
      tick.stop(ct + endTime);
    }
    inst.start(startTime);
    inst.stop(ct + endTime + 0.15);
    inst.onended = (e) => {
      ErieGlobalControl = undefined;
      ErieGlobalState = undefined;
      resolve();
    };
  });
}

export async function playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters) {
  // clear previous state
  ErieGlobalState = undefined;

  // set audio context controls
  ErieGlobalControl = { type: Tone, player: ctx };

  if (sound.tap !== undefined && sound.tap?.pattern?.constructor.name === "Array") {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    let tapSound = deepcopy(sound);
    let t = 1, acc = 0, i = 0; // d
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
      if (i == sound.tap.pattern) {
        console.log("...?")
        ErieGlobalControl = undefined;
        ErieGlobalState = undefined;
        return;
      }
    }
  } else {
    let ct = config?.context_time !== undefined ? config.context_time : setCurrentTime(ctx);
    await __playSingleTone(ctx, ct, sound, config, instSamples, synthDefs, waveDefs, filters);
    ErieGlobalControl = undefined;
    ErieGlobalState = undefined;
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
    } else if (registeredFilters[filterName]) {
      filterNodes[filterName] = new registeredFilters[filterName].filter(ctx);
      filterEncoders[filterName] = registeredFilters[filterName].encoder;
      filterFinishers[filterName] = registeredFilters[filterName].finisher
    }
  }
  let destination = ctx.destination;
  for (const filterName of filters) {
    let filter = filterNodes[filterName];
    if (filter) {
      filter.connect(destination);
      filter.initialize(ct);
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
    if (inst?.constructor.name === "OscillatorNode") {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
    } else if (inst?.constructor.name === "ErieSynth") {
      inst.frequency.setValueAtTime(sound.pitch || inst.carrierPitch || DefaultFrequency, ct);
      if (inst.type === FM && sound.modulation !== undefined) {
        inst.modulator.frequency.setValueAtTime((sound.modulation * inst.modulatorVolume), ct);
      } else if (inst.type === AM && sound.harmonicity !== undefined) {
        inst.modulator.frequency.setValueAtTime((sound.pitch || inst.carrierPitch || DefaultFrequency) * inst.harmonicity, ct);
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

    if (sound.detune && NoiseTypes.includes(iType)) {
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

  return new Promise((resolve, reject) => {
    var synth = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance(sound.speech);
    if (config?.speechRate !== undefined) utterance.rate = config?.speechRate;
    else if (sound?.speechRate !== undefined) utterance.rate = sound?.speechRate;
    if (sound?.pitch !== undefined) utterance.pitch = sound.pitch;
    if (sound?.loudness !== undefined) utterance.volume = sound.loudness;
    if (sound?.language) utterance.lang = bcp47language.includes(sound.language) ? sound.language : document?.documentElement?.lang;
    else utterance.lang = document.documentElement.lang;
    // let speechObject = {
    //   type: Speech,
    //   pitch: utterance.pitch,
    //   rate: utterance.rate,
    //   volume: utterance.volume,
    //   lang: utterance.lang,
    //   text: sound.speech
    // }
    synth.speak(utterance);
    ErieGlobalControl = { type: Speech, player: synth };
    utterance.onend = () => {
      window.removeEventListener('keypress', stop);
      ErieGlobalControl = undefined;
      ErieGlobalState = undefined;
      resolve();
    };
  });
}

export async function playRelativeDiscreteTonesAndSpeeches(ctx, queue, config, instSamples, synthDefs, waveDefs, filters) {
  // clear previous state
  ErieGlobalState = undefined;

  for (const sound of queue) {
    if (ErieGlobalState === Stopped) break;
    if (sound.speech) {
      await playSingleSpeech(sound, config);
    } else {
      await playSingleTone(ctx, sound, config, instSamples, synthDefs, waveDefs, filters);
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
  if (browser) {
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
    window.addEventListener('keypress', stop, { once: true });
    ErieGlobalPlayerEvents.set('stop-event', stop);
  }
}
export function clearPlayerEvents() {
  if (browser) {
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

// event-related
function sendToneStartEvent() {
  let playEvent = new Event("erieOnPlayTone");
  document.body.dispatchEvent(playEvent);
}
function sendToneFinishEvent() {
  let playEvent = new Event("erieOnFinishTone");
  document.body.dispatchEvent(playEvent);
}
function sendSpeechStartEvent() {
  let playEvent = new Event("erieOnPlaySpeech");
  document.body.dispatchEvent(playEvent);
}
function sendSpeechFinishEvent() {
  let playEvent = new Event("erieOnFinishSpeech");
  document.body.dispatchEvent(playEvent);
}