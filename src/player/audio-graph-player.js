import { notifyStop, notifyPause, notifyResume } from "../util/audio-graph-speech";
import {
  setPlayerEvents,
  clearPlayerEvents,
  playAbsoluteDiscreteTonesAlt,
  playAbsoluteContinuousTones,
  playSingleTone,
  playSingleSpeech,
  playRelativeDiscreteTonesAndSpeeches,
  playPause,
  // playAbsoluteSpeeches,
  makeContext,
  Tone, Speech, DefaultFrequency,
  ErieGlobalControl,
  makeOfflineContext
} from "./audio-graph-player-proto";

import { SupportedInstruments, loadSamples } from "./audio-graph-instrument-sample";
import { deepcopy, genRid, getFirstDefined } from "../util/audio-graph-util";
import { DefaultChannels } from "../scale/audio-graph-scale-constant";
import { sendQueueFinishEvent, sendQueueStartEvent, sendToneStartEvent } from "./audio-graph-player-event";
import { mergeTapPattern } from "../util/audio-graph-scale-util";
import { AudioPrimitiveBuffer, concatenateBuffers } from "../pulse/audio-primitive-buffer";
import { makeWaveFromBuffer } from "../pulse/audio-buffer-to-wave";

export const TextType = 'text',
  ToneType = 'tone',
  ToneSeries = 'tone-series',
  LegendType = 'legend',
  ToneSpeechSeries = 'tone-speech-series',
  Pause = 'pause',
  ToneOverlaySeries = 'tone-overlay-series';
const Stopped = 'stopped',
  Paused = 'paused',
  Playing = 'playing',
  Finished = 'finished';

const Types = [TextType, ToneType, ToneSeries, ToneOverlaySeries, Pause, ToneSpeechSeries, LegendType];

export class AudioGraphQueue {
  constructor() {
    this.queue = [];
    this.state = Finished;
    this.playAt;
    this.config = {};
    this.stopEvents = {};
    this.sampledInstruments = [];
    this.sampledInstrumentSources = {};
    this.chunks;
    this.export = [];
    this.samplings = {};
    this.synths = {};
    this.waves = {};
    this.playId;
    this.buffers = [];
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  setSampling(samplings) {
    this.samplings = deepcopy(samplings);
  }

  setSynths(synths) {
    this.synths = deepcopy(synths);
  }

  setWaves(waves) {
    this.waves = deepcopy(waves);
  }

  isSupportedInst(k) {
    return SupportedInstruments.includes(k);
  }
  isSampling(k) {
    return this.samplings?.[k] !== undefined;
  }
  isSynth(k) {
    return this.synths?.[k] !== undefined;
  }
  isWave(k) {
    return this.waves?.[k] !== undefined;
  }

  add(type, info, lineConfig, at) {
    let checkInstrumentSampling = new Set(), userSampledInstruments = new Set();
    if (Types.includes(type)) {
      let item = {
        type,
        config: lineConfig,
        duration: info.duration
      };
      if (type === TextType) {
        item.text = info?.text || info || '';
        if (info?.speechRate) item.speechRate = info?.speechRate;
      } else if (type === ToneType) {
        item.instrument_type = info.instrument_type;
        if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
        else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
        item.time = info.sound?.start || info.start || 0;
        item.end = info.sound?.end || (item.time + (item.sound?.duration || 0.2));
        item.duration = info.sound?.duration || (item.end - item.time) || 0.2; // in seconds
        item.pitch = info.sound?.pitch || info.pitch || DefaultFrequency;
        item.detune = info.sound?.detune || info.detune;
        item.loudness = getFirstDefined(info.sound?.loudness, info.loudness, 1);
        item.pan = info.sound?.pan || info.pan;
        item.postReverb = info.sound?.postReverb || info.postReverb || 0;
        item.timbre = info.sound?.timbre || info.timbre || info.instrument_type;
        let tapCount = info.sound?.tapCount || info.tapCount,
          tapSpeed = info.sound?.tapSpeed || info.tapSpeed;
        if (tapCount || tapSpeed) {
          item.tap = mergeTapPattern(tapCount, tapSpeed);
          item.duration = item.tap.totalLength
        }
        item.modulation = info.sound?.modulation || info.modulation || 0;
        item.harmonicity = info.sound?.harmonicity || info.harmonicity || 0;
        item.others = {};
        // custom channels;
        Object.keys(info.sound || info || {}).forEach((chn) => {
          if (!DefaultChannels.includes(chn)) {
            item.others[chn] = info.sound?.[chn] || info[chn];
          }
        });
        // filters
        item.filters = info.filters || [];
        if (this.isSupportedInst(item.timbre)) checkInstrumentSampling.add(item.timbre);
        else if (this.isSampling(item.timbre)) userSampledInstruments.add(item.timbre);
      } else if (type === ToneSeries) {
        item.instrument_type = info.instrument_type;
        if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
        else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
        item.sounds = makeSingleStreamQueueValues(info.sounds)
        if (item.sounds.hasSpeech) item.type = ToneSpeechSeries;
        item.sounds[item.sounds.length - 1].isLast = true;
        item.continued = info.continued;
        item.relative = info.relative
        // filters
        item.filters = info.filters || [];
        if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
        else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
        item.sounds.forEach((sound) => {
          if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
          else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
        });
      } else if (type === ToneOverlaySeries) {
        if (info.overlays.length > 0) {
          item.overlays = info.overlays.map((d) => {
            let o = {
              instrument_type: d.instrument_type,
              sounds: makeSingleStreamQueueValues(d.sounds),
              continued: d.continued,
              relative: d.relative,
              filters: d.filters || []
            };
            o.sounds[o.sounds.length - 1].isLast = true;
            if (this.isSupportedInst(o.instrument_type)) checkInstrumentSampling.add(o.instrument_type);
            else if (this.isSampling(o.instrument_type)) userSampledInstruments.add(o.instrument_type);
            o.sounds.forEach((sound) => {
              if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
              else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
            });
            return o;
          });
        } else {
          item.overlays = info.overlays;
        }
      } else if (type === Pause) {
        item.duration = info.duration; // in seconds
      } else if (type === LegendType) {
        Object.assign(item, info);
      }
      if (info.ramp) {
        item.ramp = deepcopy(info.ramp);
      }
      Array.from(checkInstrumentSampling).forEach((inst) => {
        if (!this.sampledInstruments.includes(inst)) {
          this.sampledInstruments.push(inst);
        }
      });
      Array.from(userSampledInstruments).forEach((inst) => {
        if (!this.sampledInstruments.includes(inst)) {
          this.sampledInstruments.push(inst);
        }
      });
      if (at !== undefined) {
        this.queue.splice(at, 0, item);
      } else {
        this.queue.push(item);
      }
    }
  }

  addMulti(multiples, lineConfig, pos) {
    let at = pos;
    for (const mul of multiples) {
      if (mul?.type) {
        this.add(mul.type, mul, lineConfig, at);
        if (at !== undefined) {
          at += 1;
        }
      }
    }
  }

  addQueue(queue, pos) {
    if (pos !== undefined) {
      this.queue.splice(pos, 0, ...queue.queue);
    } else {
      this.queue.push(...queue.queue);
    }
  }

  async play(i, j, options) {
    if (this.state !== Playing) {
      setPlayerEvents(this, this.config);
      let queue = this.queue;
      this.playAt = i || 0;
      let outputs = Array((j || this.queue.length) - i).fill({});
      // for pause & resume
      if (i !== undefined && j !== undefined) {
        queue = this.queue.slice(i, j);
      } else if (i !== undefined) {
        queue = this.queue.slice(i, this.queue.length);
      } else if (j !== undefined) {
        queue = this.queue.slice(0, j);
      }
      this.state = Playing;
      this.fireStartEvent();
      let k = 0;
      for (const item of queue) {
        console.log(item, this.state, options);
        if (this.state === Stopped || this.state === Paused) break;
        outputs[k] = await this.playLine(item, options);
        this.playAt += 1;
        k++;
      }
      this.fireStopEvent();
      clearPlayerEvents();
      this.state = Stopped;
      this.playAt = undefined;
      return outputs;
    }
  }

  async playLine(item, options) {
    let config = deepcopy(this.config);
    Object.assign(config, item.config);
    config.ramp = item.ramp;
    let bufferPrimitve;
    if (options.pcm) bufferPrimitve = new AudioPrimitiveBuffer(item.duration);
    if (item?.type === TextType) {
      await playSingleSpeech(item.text, config);
    } else if (item?.type === ToneType) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      await playSingleTone(ctx, item, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      ctx.close();
    } else if (item?.type === Pause) {
      await playPause(item.duration * 1000, config);
    } else if (item?.type === ToneSeries) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      if (item.continued) {
        await playAbsoluteContinuousTones(ctx, item.sounds, config, this.synths, this.waves, item.filters, bufferPrimitve);
      } else if (!item.relative) {
        await playAbsoluteDiscreteTonesAlt(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      } else {
        await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve)
      }
      ctx.close();
    } else if (item?.type === ToneSpeechSeries) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      ctx.close();
    } else if (item?.type === ToneOverlaySeries) {
      let promises = [];
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      for (let stream of item.overlays) {
        if (stream.continued) {
          promises.push(playAbsoluteContinuousTones(ctx, stream.sounds, config, this.synths, this.waves, stream.filters, bufferPrimitve));
        } else if (!stream.relative) {
          promises.push(playAbsoluteDiscreteTonesAlt(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
        } else {
          promises.push(playRelativeDiscreteTonesAndSpeeches(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
        }
      }
      await Promise.all(promises);
      ctx.close();
    }
    if (bufferPrimitve) {
      let currBuffer = await bufferPrimitve?.compile();
      this.buffers.push(currBuffer);
      return bufferPrimitve;
    }
    return;
  }

  stop() {
    // button-based stop
    // for event stop ==> audio-graph-player-proto.js
    if (this.state === Playing) {
      if (ErieGlobalControl?.type === Tone || ErieGlobalControl?.player?.close) {
        ErieGlobalControl.player.close();
      } else if (ErieGlobalControl?.type === Speech || ErieGlobalControl?.player?.cancel) {
        ErieGlobalControl.player.cancel();
      }
      if (this.state !== Stopped) {
        this.state = Stopped;
        notifyStop(this.config);
        this.fireStopEvent();
        clearPlayerEvents();
        this.playAt = undefined;
      }
    }
  }


  pause() {
    self.state = Paused;
    notifyPause(this.config);
  }

  // todo
  async resume() {
    await notifyResume(this.config);
    return this.play(this.playAt);
  }

  fireStartEvent() {
    this.playId = genRid();
    sendQueueStartEvent({ pid: this.playId });
  }

  fireStopEvent() {
    sendQueueFinishEvent({ pid: this.playId });
  }

  destroy() {
    this.state = Finished;
    this.queue = [];
    clearPlayerEvents();
  }

  async getFullAudio(ttsFetch) {
    let output = [];
    let ctx = new AudioContext();
    for (let i = 0; i < this.queue.length; i++) {
      let t = this.queue[i].type;
      if ([ToneType, ToneSeries, ToneOverlaySeries].includes(t)) {
        let buffers = await this.play(i, i + 1, { pcm: true });
        for (const b of buffers) {
          if (b?.constructor.name === AudioPrimitiveBuffer?.name) {
            output.push(b.compiledBuffer);
          }
        }
      } else if (t === TextType) {
        let res = await ttsFetch(this.queue[i]);
        output.push(await ctx.decodeAudioData(res));
      } else if (t === ToneSpeechSeries) {
        // todo
      }
    }

    let merged = concatenateBuffers(output);
    let blob = await makeWaveFromBuffer(merged, "mp3");
    return window.URL.createObjectURL(blob);
  }
}


function makeSingleStreamQueueValues(sounds) {
  let queue_values = [];
  for (const sound of sounds) {
    let time = sound.start !== undefined ? sound.start : sound.time;
    let dur = sound.duration !== undefined ? sound.duration : (sound.end - time);
    let tap = mergeTapPattern(sound.tapCount, sound.tapSpeed);
    if (sound.tapCount || sound.tapSpeed) {
      dur = tap.totalLength;
    }
    let ith_q = {
      pitch: sound.pitch,
      detune: sound.detune,
      loudness: sound.loudness,
      time,
      duration: dur,
      pan: sound.pan,
      speech: sound.speech,
      language: sound.language,
      postReverb: (Math.round(sound.postReverb * 100) / 100) || 0,
      timbre: sound.timbre,
      tap,
      modulation: sound.modulation || 0,
      harmonicity: sound.harmonicity || 0,
      __datum: sound.__datum,
      others: {}
    };
    if (sound.speech) {
      ith_q.duration = undefined;
      queue_values.hasSpeech = true;
    }
    // custom channels;
    Object.keys(sound || {}).forEach((chn) => {
      if (!DefaultChannels.includes(chn) && chn !== '__datum') {
        ith_q.others[chn] = sound[chn];
      }
    });
    queue_values.push(ith_q);
  }
  queue_values = queue_values.sort((a, b) => (a.time + a.duration) - (b.time + b.duration));

  return queue_values;
}
