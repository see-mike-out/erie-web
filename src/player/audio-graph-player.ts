import {
  setPlayerEvents,
  clearPlayerEvents,
  playAbsoluteDiscreteTonesAlt,
  playAbsoluteContinuousTones,
  playSingleTone,
  playSingleSpeech,
  playRelativeDiscreteTonesAndSpeeches,
  playPause,
  makeContext,
  ErieGlobalControl
} from "./audio-graph-player-proto";
import {
  loadSamples
} from "./audio-graph-instrument-sample";
import {
  sendQueueFinishEvent,
  sendQueueStartEvent
} from "./audio-graph-player-event";

import {
  AudioPrimitiveBuffer,
  concatenateBuffers,
  makeWaveFromBuffer
} from "../pulse";
import {
  DefaultChannels,
  SupportedInstruments,
  TextType,
  ToneType,
  ToneSeries,
  ToneSpeechSeries,
  Pause,
  ToneOverlaySeries,
  SpeechType,
  DefaultFrequency,
  Stopped,
  Paused,
  Playing,
  Finished,
  QueueItemTypes,
  PlayerStatus,
  ConfigInterface,
  HashedSampledToneObject,
  HashedSynthObject,
  HashedWaveObject,
  AudioGraphQueueItem,
  isTextQueueItem,
  isToneQueueItem,
  isTextInfo,
  isSoundInfo,
  PreGraphItem,
  Glyph,
  isPauseInfo,
  isPauseQueueItem,
  isToneSeriesQueueItem,
  isToneSeriesInfo,
  Glyphs2,
  isToneOverlayInfo,
  isToneOverlaySeriesQueueItem,
  AudioGraphQueueItemToneSeries,
  RecordObject,
  isToneSpeechSeriesQueueItem,
  isSeriesQueueItem,
  CompressedPreGraphItem
} from "../types";
import {
  notifyStop,
  notifyPause,
  notifyResume,
  deepcopy,
  genRid,
  mergeTapPattern
} from "../util";

export class AudioGraphQueue {
  queue: AudioGraphQueueItem[];
  state: PlayerStatus;
  playAt!: number | undefined;
  config: ConfigInterface;
  sampledInstruments: string[];
  sampledInstrumentSources: any;
  samplings: HashedSampledToneObject;
  synths: HashedSynthObject;
  waves: HashedWaveObject;
  playId!: string;
  buffers: any[];

  constructor() {
    this.queue = [];
    this.state = Finished;
    this.playAt;
    this.config = {};
    this.sampledInstruments = [];
    this.sampledInstrumentSources = {};
    this.samplings = {};
    this.synths = {};
    this.waves = {};
    this.playId;
    this.buffers = [];
  }

  // set
  setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  setSampling(samplings: HashedSampledToneObject) {
    this.samplings = deepcopy(samplings);
  }

  setSynths(synths: HashedSynthObject) {
    this.synths = deepcopy(synths);
  }

  setWaves(waves: HashedWaveObject) {
    this.waves = deepcopy(waves);
  }

  // checks
  isSupportedInst(k: string) {
    return SupportedInstruments.includes(k);
  }
  isSampling(k: string) {
    return this.samplings?.[k] !== undefined;
  }
  isSynth(k: string) {
    return this.synths?.[k] !== undefined;
  }
  isWave(k: string) {
    return this.waves?.[k] !== undefined;
  }

  add(
    type: typeof QueueItemTypes[number],
    info: PreGraphItem,
    lineConfig?: ConfigInterface,
    at?: number
  ) {
    let checkInstrumentSampling: Set<string> = new Set(),
      userSampledInstruments: Set<string> = new Set();
    if (QueueItemTypes.includes(type)) {
      let item: AudioGraphQueueItem = {
        type,
        config: lineConfig,
      };
      if (type === TextType && isTextQueueItem(item) && isTextInfo(info)) {
        item.text = info?.speech ?? '';
        if (info?.speechRate) item.speechRate = info?.speechRate;
      } else if (type === ToneType && isToneQueueItem(item) && isSoundInfo(info)) {
        item.instrument_type = info.instrument_type;
        if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
        else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
        item.time = info.sound?.start ?? (info as Glyph).start ?? 0;
        item.end = info.sound?.end ?? (item.time + (info.sound?.duration || 0.2));
        item.duration = info.sound?.duration ?? (item.end - item.time) ?? 0.2; // in seconds
        item.pitch = info.sound?.pitch ?? DefaultFrequency;
        item.detune = info.sound?.detune;
        item.loudness = info.sound?.loudness ?? 1;
        item.pan = info.sound?.pan;
        item.postReverb = info.sound?.postReverb ?? 0;
        item.timbre = info.sound?.timbre ?? info.instrument_type;
        let tapCount = info.sound?.tapCount,
          tapSpeed = info.sound?.tapSpeed;
        if (tapCount || tapSpeed) {
          item.tap = mergeTapPattern(tapCount, tapSpeed);
          item.duration = item.tap?.totalLength
        }
        item.modulation = info.sound?.modulation ?? 0;
        item.harmonicity = info.sound?.harmonicity ?? 0;
        item.others = {};
        // custom channels;
        Object.keys(info.sound ?? {}).forEach((chn) => {
          if (item.others && !DefaultChannels.includes(chn)) {
            item.others[chn] = info.sound?.[chn as keyof Glyph];
          }
        });

        if (item.others && info.sound.others) {
          Object.assign(item.others, info.sound.others);
        }
        // filters
        item.filters = info.filters ?? [];
        if (this.isSupportedInst(item.timbre)) checkInstrumentSampling.add(item.timbre);
        else if (this.isSampling(item.timbre)) userSampledInstruments.add(item.timbre);
      } else if (type === ToneSeries && isSeriesQueueItem(item) && isToneSeriesInfo(info)) {
        item.duration = info.duration;
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
          if (sound.timbre && this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
          else if (sound.timbre && this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
        });
        if (info.ramp) {
          item.ramp = deepcopy(info.ramp);
        }
      } else if (type === ToneOverlaySeries && isToneOverlaySeriesQueueItem(item) && isToneOverlayInfo(info)) {
        item.duration = info.duration;
        if (info.overlays.length > 0) {
          item.overlays = info.overlays.map((d) => {
            let o = {
              instrument_type: d.instrument_type,
              sounds: makeSingleStreamQueueValues(d.sounds),
              continued: d.continued,
              relative: d.relative,
              filters: d.filters || []
            } as AudioGraphQueueItemToneSeries;
            o.sounds[o.sounds.length - 1].isLast = true;
            if (this.isSupportedInst(o.instrument_type)) checkInstrumentSampling.add(o.instrument_type);
            else if (this.isSampling(o.instrument_type)) userSampledInstruments.add(o.instrument_type);
            o.sounds.forEach((sound) => {
              if (sound.timbre && this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
              else if (sound.timbre && this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
            });
            if (d.ramp) {
              o.ramp = deepcopy(d.ramp);
            }
            return o;
          });
        } else {
          item.overlays = info.overlays as AudioGraphQueueItemToneSeries[];
        }
      } else if (type === Pause && isPauseQueueItem(item) && isPauseInfo(info)) {
        item.duration = info.duration; // in seconds
      }
      //  else if (type === LegendType) {
      //   Object.assign(item, info);
      // }
      Array.from(checkInstrumentSampling).forEach((inst: string) => {
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

  addMulti(
    multiples: Array<CompressedPreGraphItem>,
    lineConfig: ConfigInterface,
    pos?: number) {
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

  addQueue(queue: AudioGraphQueue, pos?: number) {
    if (pos !== undefined) {
      this.queue.splice(pos, 0, ...queue.queue);
    } else {
      this.queue.push(...queue.queue);
    }
  }

  async play(
    i?: number,
    j?: number,
    options?: RecordObject
  ) {
    if (this.state !== Playing) {
      setPlayerEvents(this, this.config);
      let queue = this.queue;
      this.playAt = i || 0;
      let outputs = Array((j || queue.length) - (i || 0)).fill({});
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
        // @ts-ignore
        // why? the below condition can change over time
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

  async playLine(
    item: AudioGraphQueueItem,
    options?: RecordObject
  ) {
    let config = deepcopy(this.config);
    if ('config' in item && item.config) Object.assign(config, item.config);
    if ('ramp' in item && item.ramp) config.ramp = item.ramp;
    let bufferPrimitve: AudioPrimitiveBuffer | undefined;
    if (options?.pcm) {
      if (item.duration === undefined) {
        console.error("For PCM generation, duration must be specified!", item)
      } else {
        bufferPrimitve = new AudioPrimitiveBuffer(item.duration);
      }
    }
    let ttsFetchFunction = options?.ttsFetchFunction
    if (isTextQueueItem(item)) {
      await playSingleSpeech(item.text, config, bufferPrimitve, ttsFetchFunction);
    } else if (isToneQueueItem(item)) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      await playSingleTone(ctx, item, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      ctx.close();
    } else if (isPauseQueueItem(item)) {
      await playPause(item.duration * 1000, config);
    } else if (isToneSeriesQueueItem(item)) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      if (item.continued) {
        config.instrument_type = item.instrument_type;
        await playAbsoluteContinuousTones(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      } else if (!item.relative) {
        await playAbsoluteDiscreteTonesAlt(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve);
      } else {
        await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction)
      }
      ctx.close();
    } else if (isToneSpeechSeriesQueueItem(item)) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters, bufferPrimitve, ttsFetchFunction);
      ctx.close();
    } else if (isToneOverlaySeriesQueueItem(item)) {
      let promises = [];
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings, this.config.options?.baseUrl)
        }
      }
      for (let stream of item.overlays) {
        if (stream.continued) {
          config.instrument_type = stream.instrument_type;
          promises.push(playAbsoluteContinuousTones(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters, bufferPrimitve));
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
      if (ErieGlobalControl?.type === ToneType || ErieGlobalControl?.player?.close) {
        ErieGlobalControl.player.close();
      } else if (ErieGlobalControl?.type === SpeechType || ErieGlobalControl?.player?.cancel) {
        ErieGlobalControl.player.cancel();
      }
      // @ts-ignore
      // this can be changed over time!
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
    this.state = Paused;
    notifyPause(this.config);
  }

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

  async getFullAudio(
    ttsFetchFunction: Function
  ) {
    let output = [];
    let ctx = new AudioContext();

    let options = { pcm: true, ttsFetchFunction }
    for (let i = 0; i < this.queue.length; i++) {
      let buffers = await this.play(i, i + 1, options);
      if (buffers) {
        for (const b of buffers) {
          if (b?.constructor.name === AudioPrimitiveBuffer?.name) {
            output.push(b.compiledBuffer);
          } else {
            output.push(await ctx.decodeAudioData(b));
          }
        }
      }
    }

    let merged = concatenateBuffers(output);
    let blob = await makeWaveFromBuffer(merged, "mp3");
    // @ts-ignore
    return window.URL.createObjectURL(blob);
  }
}


function makeSingleStreamQueueValues(
  sounds: Glyph[]
): Glyphs2 {
  let queue_values: Glyph[] = [];
  for (const sound of sounds) {
    let time = sound.start !== undefined ? sound.start : sound.time;
    let dur = sound.duration !== undefined ? sound.duration : ((sound.end ?? 0) - (time ?? 0));
    let tap = mergeTapPattern(sound.tapCount, sound.tapSpeed);
    if (sound.tapCount || sound.tapSpeed) {
      if (tap?.totalLength !== undefined) dur = tap.totalLength;
    }
    let ith_q: Glyph = {
      pitch: sound.pitch,
      detune: sound.detune,
      loudness: sound.loudness,
      time,
      duration: dur,
      pan: sound.pan,
      speech: sound.speech,
      language: sound.language,
      postReverb: (Math.round((sound.postReverb ?? 0) * 100) / 100),
      timbre: sound.timbre,
      tap,
      modulation: sound.modulation || 0,
      harmonicity: sound.harmonicity || 0,
      __datum: sound.__datum,
      others: {}
    };
    if (sound.speech) {
      ith_q.duration = undefined;
      (queue_values as Glyphs2).hasSpeech = true;
    }
    // custom channels;
    Object.keys(sound || {}).forEach((chn) => {
      if (ith_q.others && !DefaultChannels.includes(chn) && chn !== '__datum') {
        ith_q.others[chn] = sound[chn];
      }
    });
    if (ith_q.others && sound.others) {
      Object.assign(ith_q.others, sound.others);
    }
    queue_values.push(ith_q);
  }
  queue_values = queue_values.sort((a: Glyph, b: Glyph) => ((a.time ?? 0) + (a.duration ?? 0)) - ((b.time ?? 0) + (b.duration ?? 0)));

  return queue_values as Glyphs2;
}


export function isAudioGraphQueue(o: any): o is AudioGraphQueue {
  return o?.constructor?.name === AudioGraphQueue.name;
}