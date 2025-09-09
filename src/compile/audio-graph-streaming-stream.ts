import { Chimes, playChime } from '../chimes';
import {
  AudioGraphQueue,
  emitNoteStopEvent,
  loadSamples,
  playAbsoluteDiscreteTones,
  playPause,
  playSingleSpeech,
  rampContinuousTone,
  sendStreamingSignal,
  setErieGlobalStreamingControl
} from '../player';
import { playIndefininteContinuousTones } from '../player/proto/audio-graph-player-ind-cont-tones';
import { AudioPrimitiveBuffer } from '../pulse';
import {
  AudioGraph,
  ConfigInterface,
  RampType,
  ScaleCollection,
  ToneType,
  TextType,
  DefaultFrequency,
  OmitDesc,
  HashedObject,
  SampledToneNormed,
  SynthNormed,
  WaveNormed,
  TransformerFunction,
  StreamingOption,
  Datum,
  PlaybackUnitDatum,
  PlaybackUnitTime,
  StreamingHistoryItem,
  PlaybackUnitInstance,
  PlaybackUnits,
  PlayerStatus,
  Stopped,
  Playing,
  NotifyType,
  NotifySpec,
  Glyphs2,
  LoadedSampleCollection,
  LoadedMonoSample,
  OscTypes,
  RecordObject,
  Glyph,
  ToneSeries,
  InternalData,
  StreamerInstrument,
  EncodingItemNormed,
  StreamingRepeatObject,
  KeyOrder
} from '../types';
import {
  toOrdinalNumbers,
  deepcopy
} from '../util';
import { UnitStream } from './audio-graph-unit-stream';

export const DefaultHistoryLimit = 100,
  DefaultHistoryQuery = PlaybackUnitInstance,
  DefaultPlaybackLimit = 3,
  DefaultPlaybackSpeed = 2,
  DefaultNoitfyOptions: NotifySpec = {
    beforePlayback: { speech: 'Old data', language: 'en-US', speechRate: 1 },
    afterPlayback: { speech: 'End of old data', language: 'en-US', speechRate: 1 },
    incoming: { speech: 'Incoming', language: 'en-US', speechRate: 1 },
    beforePlay: { speech: 'New data', language: 'en-US', speechRate: 1 },
    afterPlay: { speech: 'End of new data', language: 'en-US', speechRate: 1 },
    next: { speech: 'Next in history', language: 'en-US', speechRate: 1 }
  },
  PauseForBase = 1000,
  PauseNoBase = 1000;

// no recording supported (yet)!

export class StreamingStream {
  instrument_type: string;
  is_continued: boolean;
  is_relative: boolean;
  stream!: AudioGraph;
  scales: ScaleCollection;
  ramp: { [key: string]: RampType | undefined };
  transformer: TransformerFunction;
  duration!: number;
  encoder!: Function;
  sorter!: Function;
  repeat!: StreamingRepeatObject;

  name!: string;
  title!: string;
  description!: string;
  option: StreamingOption;
  config: ConfigInterface;

  audioFilters!: string[];
  synths: HashedObject<SynthNormed>;
  samplings: HashedObject<SampledToneNormed>;
  loaded_samples: LoadedSampleCollection;
  waves: HashedObject<WaveNormed>;
  noitify_samples: LoadedSampleCollection;

  history: StreamingHistoryItem[];
  current!: InternalData;
  playQueue: StreamingHistoryItem[];
  at: null | string | number;
  is_diffed: boolean;

  has_base_tone: boolean;
  baseContext!: AudioContext;
  baseStream!: StreamerInstrument;
  baseTone!: any;
  baseValues: RecordObject;
  baseToneSustain!: RecordObject;
  baseToneSampled!: string | undefined;
  currentQueue!: AudioGraphQueue;

  status: PlayerStatus
  is_destroyed: boolean;
  is_started: boolean;
  is_muted: boolean;

  constructor(
    opt: StreamingOption
  ) {
    this.instrument_type = 'default';
    this.is_continued = false;
    this.is_relative = false;
    this.stream;
    this.scales = {};
    this.ramp = {};
    this.transformer = (d, old) => d;
    this.encoder;
    this.sorter;
    this.repeat;

    this.synths = {};
    this.samplings = {};
    this.loaded_samples = {};
    this.waves = {};
    this.audioFilters = [];

    this.history = [];
    this.current;
    this.playQueue = [];
    this.at = null;
    this.is_diffed = false;

    this.has_base_tone = false;
    this.baseTone;
    this.baseStream;
    this.baseContext;
    this.baseValues = {};
    this.currentQueue;

    this.name;
    this.option = opt || {};
    this.config = {};
    this.noitify_samples = {};

    this.status = Stopped; // for the player
    this.is_destroyed = false; // for the object
    this.is_started = false;
    this.is_muted = false;

    this.getNotificationSampling();
  }

  // registrations
  setTitle(t: string) {
    this.title = t;
  }

  setDescription(d: string) {
    this.description = d;
  }

  setName(name: string) {
    this.name = name;
  }


  setStream(d: UnitStream) {
    // copy from unit stream;
    this.instrument_type = d.instrument_type;
    this.is_continued = d.option.is_continued;
    this.has_base_tone = d.option.has_base_tone ?? false;
    this.is_relative = d.option.relative;
    this.audioFilters = d.audioFilters ?? [];
    this.ramp = d.ramp;
    this.config = d.config;
    this.stream = d.stream;
    this.scales = d.scales;
    this.duration = d.duration;
    if (d.name) this.name = d.name;
    if (d.title) this.title = d.title;
    if (d.description) this.description = d.description;
  }

  setBase(toneType?: string, baseValues?: RecordObject, sustain?: RecordObject, options?: RecordObject) {
    this.baseTone = toneType || 'sine';
    this.baseToneSampled = options?.sample;
    this.baseToneSustain = sustain ?? {};
    if (baseValues) {
      Object.assign(this.baseValues, baseValues);
    }
    // set default values
    if (this.baseValues.pitch === undefined) this.baseValues.pitch = DefaultFrequency;
    if (this.baseValues.loudness === undefined) this.baseValues.loudness = 0.1;
    if (this.baseValues.panX === undefined) this.baseValues.panX = 0;
    if (options) {
      this.baseValues.option = options;
    }
  }

  setTransformer(f: TransformerFunction, has_diffing: boolean) {
    this.is_diffed = has_diffing
    this.transformer = f;
  }

  setEncoder(f: Function) {
    this.encoder = f;
  }

  setSorter(f: Function) {
    this.sorter = f;
  }

  setRepeat(r: EncodingItemNormed) {
    if (!r.scale?.[KeyOrder]) {
      console.error("A streaming REPEAT field needs explicit ordering.")
    } else {
      let field = r.field instanceof Array ? r.field : [r.field];
      let order = r.scale?.[KeyOrder];
      if (typeof r.field == 'string') {
        order = order.map((d) => d instanceof Array ? d : [d]);
      }
      this.repeat = {
        field,
        order,
        checker: (x: Datum, oi: number) => {
          return field.map((f, fi) => order[oi][fi] == x[f]).every(x => x)
        },
        announce: r.speech ?? true
      };
    }
  }

  setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  setFilters(audioFilters: string[]) {
    this.audioFilters = audioFilters
  }

  setRamp(ramp: { [key: string]: RampType | undefined }) {
    this.ramp = deepcopy(ramp);
  }

  setSampling(samplings: HashedObject<SampledToneNormed>) {
    this.samplings = deepcopy(samplings);
    // load them here;
    for (const inst in this.samplings) {
      loadSamples(new AudioContext(), inst, this.samplings, this.config.options?.baseUrl).then((sample) => {
        this.loaded_samples[inst] = sample;
      })
    }
  }

  setSynths(synths: HashedObject<SynthNormed>) {
    this.synths = synths;
  }

  setWaves(waves: HashedObject<WaveNormed>) {
    this.waves = waves;
  }

  // references
  make_tone_text(i: number) {
    let text = [];
    let identifier = (i !== undefined ? `The ${toOrdinalNumbers(i + 1)}` : `This`)
    if (this.name) text.push({ type: TextType, speech: `${identifier} stream is for ${this.name} layer and has a tone of`, speechRate: this.config?.speechRate });
    else text.push({ type: TextType, speech: `${identifier} stream has a tone of`, speechRate: this.config?.speechRate });
    text.push({ type: ToneType, sound: { pitch: DefaultFrequency, duration: 0.2, start: 0 }, instrument_type: this.instrument_type });
    return text;
  }

  make_scale_text(
    channel?: string
  ) {
    let scales = this.scales;
    let text = Object.keys(scales)
      .filter((chn) => ((!channel && !OmitDesc.includes(chn)) || chn === channel))
      .map((c: string) => {
        return {
          id: scales[c]?.scaleId,
          channel: c,
          description: scales[c]?.description
        };
      });
    return text.flat();
  }

  // player functions
  async play_test() {
    this.muteBaseTick();
    if (!this.is_started) {
      console.warn("Start the stream first!")
    } else if (this.option.test_data && this.option.test_data.test) {
      await this.play(this.option.test_data.test, true)
    } else {
      console.warn("No test data is provoded.")
    }
    this.unmuteBaseTick();
  }

  start() {
    if (this.is_started) {
      console.warn("This stream is already started. If you want to re-initiate, then destroy and restart the stream.");
      return;
    }
    if (!this.is_started) {
      if (this.is_destroyed) {
        console.warn("This stream is destroyed. Crreating a new stream.")
      }
      this.baseContext = new AudioContext();
      if (this.has_base_tone) {
        if (OscTypes.includes(this.baseTone) || this.baseTone in this.synths) {
          let config = deepcopy(this.config);
          config.ramp = this.ramp;
          config.instrument_type = this.baseValues.timbre ?? this.baseTone ?? 'sine';
          let baseValues = deepcopy(this.baseValues)
          if (this.baseValues.option.asTick) {
            config.tick = {
              interval: this.baseValues.option.tickInterval ?? 5,
              band: 0.2,
              instrument: this.baseToneSampled ?? config.instrument_type ?? 'default'
            };
            if (baseValues.pitch) config.tick.pitch = baseValues.pitch;
            else config.tick.pitch = 100;
            if (baseValues.loudness) config.tick.loudness = baseValues.loudness;
            baseValues.loudness = 0.0001
          }
          this.baseStream = playIndefininteContinuousTones(
            this.baseContext,
            baseValues,
            config,
            this.loaded_samples,
            this.synths,
            this.waves,
            this.audioFilters,
            undefined
          );
        }
      }
      this.is_destroyed = false;
      this.is_started = true;
    }
    return this;
  }

  async play(d: Datum[],
    test?: boolean,
    playback_query?: { unit?: typeof PlaybackUnits[number], limit?: number, speed?: number },
    bufferPrimitve?: AudioPrimitiveBuffer,
    ttsFetchFunction?: any
  ) {
    if (this.is_destroyed) {
      console.error("This stream is destroyed. Start this stream again.");
      return;
    }
    if (!this.is_started) {
      console.error("This stream has not be started yet.");
      return;
    }

    this.muteBaseTick();
    this.addToFutureQueue(d, new Date());
    if (this.status === Playing) {
      return;
    }
    this.status = Playing;

    await this.notify('incoming', bufferPrimitve, ttsFetchFunction);

    let play_hitory: boolean = true;
    if (!this.option.playback || this.option.playback?.init_by == 'manual') play_hitory = false;
    if (playback_query) play_hitory = true;

    let playback_history!: Datum[]
    if (play_hitory) {
      if (this.option.playback && !test) {
        let condition = this.option.playback?.condition ?? ((_: any) => true);
        if (condition(this.current)) playback_history = this.queryHistory(playback_query?.unit, playback_query?.limit);
      }
      if (!test && playback_history && playback_history.length > 0) {
        if (this.is_diffed && (playback_query?.limit ?? this.option.playback?.limit ?? DefaultPlaybackLimit) == 1) {
          // pass
        } else {
          // play history
          playback_history.reverse(); // reversing because history queue stores from latest to oldest
          await this.notify('beforePlayback', bufferPrimitve, ttsFetchFunction);
          let inQueue = 0;
          for (let item of playback_history) {
            let transformed = this.transformer(item, inQueue > 0 ? playback_history[inQueue - 1] : [])
            if (transformed.length > 0) {
              if (inQueue > 0) {
                await this.notify('next', bufferPrimitve, ttsFetchFunction);
              }
              this.setEmitAt('history-' + inQueue);
              await this._play(this.sorter(transformed), this.option.playback?.speed ?? DefaultPlaybackSpeed, bufferPrimitve, ttsFetchFunction, this.option.playback?.instrument);
              inQueue++;
            }
          }
          await this.notify('afterPlayback', bufferPrimitve, ttsFetchFunction);
        }
      }
    }
    // play current thing
    await this.notify('beforePlay', bufferPrimitve, ttsFetchFunction);
    let inQueue = 0;
    //@ts-ignore
    if (this.status == Stopped) return;
    while (this.playQueue.length > 0) {
      let curr = this.playQueue.shift();
      if (curr) {
        if (inQueue > 0) {
          await this.notify('next', bufferPrimitve, ttsFetchFunction);
        }
        let transformed = this.transformer(curr.data, play_hitory && playback_history.length > 0 ? playback_history[0] : []);
        this.current = this.sorter(transformed);
        console.log(this.current)
        this.setEmitAt(!test ? 'current-' + inQueue : 'test-' + inQueue)
        await this._play(this.current, 1, bufferPrimitve, ttsFetchFunction);
        // add to history
        if (!test) {
          this.addToHistory(curr.data, curr.time);
        }
      }
      inQueue++;
    }
    await this.notify('afterPlay', bufferPrimitve, ttsFetchFunction);
    this.status = Stopped;
    this.setEmitAt(null);
    this.unmuteBaseTick();
  }

  private async _play(
    d: Datum[], // transformed
    _speed?: number,
    bufferPrimitve?: AudioPrimitiveBuffer,
    ttsFetchFunction?: any,
    instrument?: string
  ) {
    if (this.status == Stopped) return;
    let speed: number = _speed ?? 1;
    if (speed <= 0) {
      console.warn('Playback speed must be greater than zero. Defaulted to 1.')
      speed = 1;
    }
    let repeat = this.repeat;

    let converted_groups: Glyphs2[] = !repeat ? [this.encode(d, speed, instrument)] : repeat.order.map((o, oi) => {
      return this.encode(d.filter((x) => repeat.checker(x, oi)), speed, instrument);
    });
    let ci = 0;
    for (const converted of converted_groups) {
      if (converted.length > 0) {
        if (repeat && repeat.announce) {
          let ann = repeat.order[ci].join(', ')
          await playSingleSpeech({ type: "text", speech: ann }, this.config, bufferPrimitve, ttsFetchFunction);
        }

        if (this.has_base_tone && !this.baseValues.option?.asTick) {
          // assign values
          if (!this.baseStream) {
            console.warn('Start the player first.')
          }
          let endTime: number | 'after_previous' =
            typeof converted[converted.length - 1].start === 'number' ?
              ((converted[converted.length - 1].start as number) + (converted[converted.length - 1].duration ?? 0))
              : 'after_previous';
          let duration: number = endTime == 'after_previous' ? converted.map(d => d.duration ?? 0).reduce((a, c) => a + c, 0) : endTime;
          if (this.baseToneSustain) {
            let finish_sound: Glyph = {
              start: endTime,
            }
            Object.keys(this.baseValues).forEach((key: keyof Glyph) => {
              if (!this.baseToneSustain[key] && !['time', 'duration'].includes(key as string)) {
                finish_sound[key] = this.baseValues[key]
              } else if (this.baseToneSustain[key] && !['time', 'duration'].includes(key as string)) {
                finish_sound[key] = converted[converted.length - 1][key]
              }
            });
            converted.push(finish_sound);
          }
          this.unmuteBaseTone();
          await rampContinuousTone(
            this.baseContext,
            converted,
            duration,
            this.baseStream.inst,
            this.baseStream.panner,
            this.baseStream.isStereo,
            this.baseStream.gain,
            this.baseStream.rampers,
            this.audioFilters,
            this.baseStream.filterNodes,
            this.baseStream.filterEncoders,
            this.baseStream.filterFinishers,
            this.config
          )
        } else {
          // prerender
          this.currentQueue = new AudioGraphQueue();

          // overall config
          if (this.config) {
            Object.keys(this.config).forEach((key) => {
              this.currentQueue?.setConfig(key, this.config[key]);
            })
          }

          // registration
          this.currentQueue.setSampling(this.samplings);
          this.currentQueue.setSynths(this.synths);
          this.currentQueue.setWaves(this.waves);

          // setting queue
          let _c = deepcopy(this.config || {});
          this.currentQueue.add(ToneSeries, 0, {
            instrument_type: instrument ?? this.instrument_type,
            sounds: converted,
            continued: this.is_continued,
            relative: this.is_relative,
            filters: this.audioFilters,
            ramp: this.ramp,
            duration: this.duration
          }, _c);

          this.currentQueue.setConfig('options', this.config.options);
          await this.currentQueue.play();
        }
      }
      ci++;
    }
  }

  async cancel() {
    // for the current stream;
    if (this.status == Playing) {
      this.status = Stopped;
      emitNoteStopEvent('stop', {});
      if (this.playQueue.length > 0) {
        while (this.playQueue.length > 0) {
          let item = this.playQueue.shift();
          if (item) this.addToHistory(item.data, item.time);
        }
      }
    }
    return this;
  }

  async stop() {
    await this.cancel();
    return this;
  }

  muteBaseTone() {
    if (this.baseStream) { this.baseStream.gain.gain.value = 0; }
    this.is_muted = true;
    return this;
  }

  unmuteBaseTone() {
    if (this.baseStream) {
      if (!this.baseValues.option?.asTick)
        this.baseStream.gain.gain.value = this.baseValues.loudness;
    }

    this.is_muted = false;
    return this;
  }

  muteBaseTick() {
    setErieGlobalStreamingControl('streaming_base_tick_mute', true);
  }
  unmuteBaseTick() {
    setErieGlobalStreamingControl('streaming_base_tick_mute', false);
  }

  destroy() {
    // for the entirety
    this.cancel().then(() => {
      // remove the player
      if (this.baseStream) {
        this.baseStream.inst.stop(this.baseContext.currentTime);
        if (this.baseStream.tick_interval_id) {
          clearInterval(this.baseStream.tick_interval_id)
        }
      }
      if (this.baseContext) this.baseContext.close();
    });
    this.status = Stopped;
    this.is_destroyed = true;
    this.is_started = false;
    return this;
  }

  // processors
  private encode(data: InternalData, speed: number, override_instrument?: string): Glyphs2 {
    let has_speech = false;
    if (!this.encoder) {
      console.error("No encoder found.")
    }

    let audio_graph = this.encoder(data);

    audio_graph.forEach((c: Glyph) => {
      if (c.start && c.start !== 'after_previous') c.start = c.start / speed;
      if (c.duration) c.duration = c.duration / speed;
      if (c.end) c.end = c.end / speed;
      if (c.speech !== undefined) has_speech = true;
      if (c.loudness === undefined) c.loudness = 1;
      if (override_instrument) {
        c.timbre = override_instrument;
        if (c.others) {
          c.others.timbre = override_instrument
        }
      }
    });

    (audio_graph as Glyphs2).hasSpeech = has_speech;
    return audio_graph as Glyphs2;
  }

  // notification
  async notify(when: NotifyType, bufferPrimitve?: AudioPrimitiveBuffer, ttsFetchFunction?: any) {
    //@ts-ignore
    if (this.status == Stopped) return;
    if (this.option.notify?.[when] !== false) {
      this.setEmitAt('notify-' + when);
      let ctx = this.baseContext;
      let notificationItem = this.option.notify?.[when] ?? DefaultNoitfyOptions[when];
      if (notificationItem === true) notificationItem = DefaultNoitfyOptions[when];
      if (notificationItem instanceof Object) {
        this.muteBaseTone()
        let pause_time = notificationItem.pause ?? this.has_base_tone ? PauseForBase : PauseNoBase
        if ('speech' in notificationItem && notificationItem.speech) {
          // todo: test
          await playPause(pause_time);
          await playSingleSpeech(
            {
              type: TextType,
              speech: notificationItem.speech,
              speechRate: notificationItem.speechRate ?? 1.75,
              language: notificationItem.language,
              pitch: notificationItem.pitch,
              loudness: notificationItem.loudness ?? 1
            },
            { speechRate: notificationItem.speechRate },
            bufferPrimitve,
            ttsFetchFunction,
          )
          await playPause(pause_time);
        } else if ('sample' in notificationItem && notificationItem.sample) {
          // todo: test
          try {
            let sample = this.noitify_samples[when];
            if (!sample) {
              console.error("Sample is not loaded");
            }
            let dur = (sample as LoadedMonoSample).mono.duration;
            let glyphs = [{
              start: 0,
              duration: dur + 0.5,
              detune: notificationItem.detune ?? 0,
              loudness: notificationItem.loudness ?? 1,
              timbre: when
            }] as Glyphs2;
            glyphs.hasSpeech = false;

            await playPause(pause_time);
            await playAbsoluteDiscreteTones(ctx, glyphs, this.noitify_samples, {}, {}, {}, [], bufferPrimitve);
            await playPause(pause_time);
          } catch {
            console.warn("Sampling failed")
          }
        } else if ('chime' in notificationItem && notificationItem.chime) {
          await playPause(pause_time);
          await playChime(undefined, when as keyof typeof Chimes, bufferPrimitve)
          await playPause(pause_time);
        }
        this.unmuteBaseTone()
      }
    }
  }

  setEmitAt(at: string | null | number) {
    this.at = at;
    // event
    sendStreamingSignal({ at: this.at });
  }

  private async getNotificationSampling() {
    let ctx = this.baseContext;
    if (this.option.notify) {
      for (const when in this.option.notify) {
        let notificationItem = this.option.notify[when];
        if (notificationItem instanceof Object && 'sample' in notificationItem && notificationItem.sample) {
          this.noitify_samples[when] = await loadSamples(ctx, when, { [when]: { name: when, sample: { mono: notificationItem.sample } } }, '');
        }
      }
    }
  }

  // history
  private addToHistory(data: Datum[], time: Date) {
    this.history.unshift({ time, data });
    if (this.history.length > DefaultHistoryLimit) this.history.splice(0,);
  }

  private addToFutureQueue(data: Datum[], time: Date) {
    this.playQueue.push({ time, data });
  }

  queryHistory(_unit?: typeof PlaybackUnits[number], _limit?: number): Array<Datum[]> {
    let unit = _unit ?? this.option.playback?.unit ?? DefaultHistoryQuery;
    let limit = _limit ?? this.option.playback?.limit ?? DefaultPlaybackLimit;
    if (limit == 0) {
      return [];
    } else if (unit === PlaybackUnitDatum) {
      let output: Array<Datum[]> = [];
      for (const item of this.history) {
        if (output.length > limit) break;
        let instance: Datum[] = [];
        for (const datum of item.data) {
          if (output.length > limit) break;
          instance.push(datum);
        }
        output.push(instance)
      }
      return output;
    } else if (unit === PlaybackUnitTime) {
      let time_threshold: number = (new Date().valueOf()) - limit;
      let output: Array<Datum[]> = [];
      for (const item of this.history) {
        if (item.time.valueOf() < time_threshold) break;
        let instance: Datum[] = [];
        for (const datum of item.data) {
          instance.push(datum);
        }
        output.push(instance)
      }
      return output;
    } else {
      // instance
      return this.history.slice(0, limit).map(d => d.data);
    }
  }
}

export function isStreamingStreamObject(o: any): o is StreamingStream {
  return o?.constructor?.name === StreamingStream.name;
}