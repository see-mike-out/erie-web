import {
  ToneType,
  TextType,
  ToneSeries,
  ToneOverlaySeries,
  AudioGraphQueue
} from '../player/audio-graph-player';
import { DefaultFrequency } from '../player/audio-graph-player-proto';
import {
  AfterAll,
  AfterThis,
  AudioGraph,
  AudioGraphSpeech,
  BeforeAll,
  BeforeThis,
  ConfigInterface,
  ForceRepeatScale,
  PlayAt,
  PreGraphSpeech,
  PreGraphSpeechItem,
  PreGraphUnit,
  RampType,
  RecordObject,
  ScaleCollection,
  HashedSampledToneObject,
  HashedSynthObject,
  HashedWaveObject
} from '../types';
import {
  toOrdinalNumbers,
  deepcopy,
  jType
} from '../util';

const OmitDesc = ['time2'];

export class SequenceStream {
  streams: Array<UnitStream | OverlayStream>;
  playing: boolean;
  prerendered: boolean;
  config: ConfigInterface;
  synths: HashedSynthObject;
  samplings: HashedSampledToneObject;
  waves: HashedWaveObject;
  name!: string;
  title!: string;
  description!: string;
  introStream?: SpeechStream;
  queue!: AudioGraphQueue;
  scaleQueue!: AudioGraphQueue;

  constructor() {
    this.streams = [];
    this.playing = false;
    this.prerendered = false;
    this.config = {};
    this.synths = {};
    this.samplings = {};
    this.waves = {};
  }

  setName(n: string) {
    this.name = n;
  }

  setTitle(t: string) {
    this.title = t;
  }
  setDescription(d: string) {
    this.description = d;
  }
  addStream(stream: UnitStream | OverlayStream) {
    this.streams.push(stream);
  }
  addStreams(streams: Array<UnitStream | OverlayStream>) {
    this.streams.push(...streams);
  }

  setSampling(samplings: HashedSampledToneObject) {
    this.samplings = samplings;
  }

  setSynths(synths: HashedSynthObject) {
    this.synths = synths;
  }
  setWaves(waves: HashedWaveObject) {
    this.waves = waves;
  }

  setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  setIntroStream(stream: SpeechStream) {
    this.introStream = stream;
  }

  async prerender() {
    this.queue = new AudioGraphQueue();
    if (this.config) {
      Object.keys(this.config).forEach((key) => {
        this.queue.setConfig(key, this.config[key]);
      })
    }
    this.queue.setSampling(this.samplings);
    this.queue.setSynths(this.synths);
    this.queue.setWaves(this.waves);

    if (!this.config.skipStartSpeech) {
      this.queue.add(TextType, { speech: `To stop playing the sonification, press the X key. `, speechRate: this.config?.speechRate }, this.config);
    }

    // 1. main title && description
    // in case of a separate intro stream
    if (this.introStream) {
      this.introStream.stream.forEach((d) => {
        this.queue.add(TextType, { speech: d.speech, speechRate: this.config?.speechRate }, this.config);
      })
    } else {
      if (this.title && !this.config.skipTitle) {
        this.queue.add(TextType, { speech: `${this.title}. `, speechRate: this.config?.speechRate }, this.config);
      } else if (this.name && !this.config.skipTitle) {
        this.queue.add(TextType, { speech: `This sonification is about ${this.name}. `, speechRate: this.config?.speechRate }, this.config);
      }
      if (this.description && !this.config.skipDescription) {
        this.queue.add(TextType, { speech: this.description, speechRate: this.config?.speechRate }, this.config);
      }
    }

    // 2. making queues
    let titles_queues: AudioGraphQueue[] = [],
      scales_queues: AudioGraphQueue[] = [],
      audio_queues: AudioGraphQueue[] = [],
      scale_count = 0,
      announced_scales: string[] = [];

    let multiSeq = this.streams.length > 1;
    if (multiSeq && !this.config.skipSquenceIntro) {
      this.queue.add(TextType, { speech: `This sonification sequence consists of ${this.streams.length} parts. `, speechRate: this.config?.speechRate }, this.config);
    }

    let oi = 0;

    for (const stream of this.streams) {
      let _c = deepcopy(this.config || {});
      Object.assign(_c, stream.config || {});
      let speechRate = _c.speechRate;
      if (multiSeq) {
        let title_queue = new AudioGraphQueue();
        if ((stream.title || stream.name) && !stream.config.skipSequenceTitle) {
          title_queue.add(TextType, { speech: `Stream ${oi + 1}. ${(stream.title || stream.name)}. `, speechRate }, _c);
        } else if (!stream.config.skipSequenceTitle) {
          title_queue.add(TextType, { speech: `Stream ${oi + 1}. `, speechRate }, _c);
        }
        if (stream.description && !stream.config.skipSequenceDescription) {
          title_queue.add(TextType, { speech: stream.description, speechRate }, _c);
        }
        titles_queues.push(title_queue);
      } else {
        titles_queues.push(new AudioGraphQueue());
      }

      let determiner = 'This';
      if (multiSeq) determiner = "The " + toOrdinalNumbers(oi + 1);

      if (!('overlays' in stream) && !_c.skipScaleSpeech) {
        let scale_text = stream.make_scale_text().filter((d) => d);
        let scales_to_announce = [];
        let forceRepeat = _c[ForceRepeatScale];
        if (!forceRepeat) forceRepeat = false;
        for (const item of scale_text) {
          if (item.description) {
            if (item.id && !announced_scales.includes(item.id)) {
              scales_to_announce.push(...item.description);
              announced_scales.push(item.id);
            } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
              scales_to_announce.push(...item.description);
            }
          }
        }

        if (scales_to_announce.length > 0) {
          let scales_queue = new AudioGraphQueue();
          scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, _c);
          scales_queue.addMulti(scales_to_announce, { ..._c, tick: null });
          scale_count++;
          scales_queues.push(scales_queue);
        } else {
          scales_queues.push(null);
        }
      } else if ('overlays' in stream) {
        // each overlay title
        if (!_c.skipTitle) titles_queues[oi].add(TextType, { speech: `${determiner} stream has ${stream.overlays.length} overlaid sounds. `, speechRate }, _c);

        let forceRepeat = _c[ForceRepeatScale];
        if (!forceRepeat) forceRepeat = false;
        let scale_init_text_added = false;
        let scales_queue = new AudioGraphQueue();

        stream.overlays.forEach((overlay, li) => {
          let __c = deepcopy(_c || {});
          Object.assign(__c, overlay.config || {});
          let speechRate = __c.speechRate
          if (__c.playRepeatSequenceName !== false && overlay.title && !__c.skipOverlayTitle) {
            titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.title}. `, speechRate }, __c);
          } else if (__c.playRepeatSequenceName !== false && overlay.name && !__c.skipOverlayTitle) {
            titles_queues[oi].add(TextType, { speech: `Overlay ${li + 1}. ${overlay.name}. `, speechRate }, __c);
          }
          if (overlay.description && !__c.skipOverlayDescription) {
            titles_queues[oi].add(TextType, { speech: overlay.description, speechRate }, __c);
          }

          let scale_text = stream.make_scale_text(undefined, li).filter((d) => d);
          let scales_to_announce = [];
          for (const item of scale_text) {
            if (item.description) {
              if (item.id && !announced_scales.includes(item.id)) {
                scales_to_announce.push(...item.description);
                announced_scales.push(item.id);
              } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
                scales_to_announce.push(...item.description);
              }
            }
          }

          if (scales_to_announce.length > 0) {
            if (!forceRepeat && !scale_init_text_added) {
              scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, __c);
              scale_init_text_added = true;
            } else {
              let determiner2 = 'This';
              if (multiSeq && li > 1) determiner2 = "The " + toOrdinalNumbers(li);
              scales_queue.add(TextType, { speech: `${determiner2} overlay has the following sound mappings. `, speechRate }, __c);
            }
            scales_queue.addMulti(scales_to_announce, { ...__c, tick: null });
            scale_count++;
          }
        });
        if (scales_queue.queue.length > 0) {
          scales_queues.push(scales_queue);
        } else {
          scales_queues.push(null);
        }
        scale_count++;
      }
      oi++;
    }

    // 3. Prerender subqueues
    for (const stream of this.streams) {
      let prerender_series = await stream.prerender(true);
      audio_queues.push(prerender_series);
    }

    // 4. queueing
    let streamIndex = 0;
    let preaddPos = this.queue.queue.length || 0;
    let preadd = [], postadd = [];
    for (const stream of this.streams) {
      let _c = deepcopy(this.config || {});
      Object.assign(_c, stream.config || {});
      let speechRate = _c.speechRate

      if (titles_queues[streamIndex]) this.queue.addQueue(titles_queues[streamIndex]);

      let scalePlayAt = _c[PlayAt];
      if (scalePlayAt === BeforeAll) {
        if (scales_queues[streamIndex]) preadd.push(scales_queues[streamIndex]);
      } else if (scalePlayAt === BeforeThis || !scalePlayAt) {
        if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
      }


      let prerender_series = audio_queues[streamIndex];
      if (!_c.skipStartPlaySpeech) {
        this.queue.add(TextType, { speech: `Start playing. `, speechRate }, _c);
      }
      if (jType(prerender_series) === AudioGraphQueue.name) {
        this.queue.addMulti(prerender_series.queue, _c);
      } else {
        this.queue.add(ToneSeries, prerender_series, _c);
      }

      if (scalePlayAt === AfterAll) {
        if (scales_queues[streamIndex]) postadd.push(scales_queues[streamIndex]);
      } else if (scalePlayAt === AfterThis) {
        if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
      }

      streamIndex++;
    }

    if (preadd.length > 0) {
      for (const pq of preadd) {
        this.queue.addQueue(pq, preaddPos);
        preaddPos += 1;
      }
    }

    if (postadd.length > 0) {
      for (const pq of preadd) {
        this.queue.addQueue(pq);
      }
    }

    if (!this.config.skipFinishSpeech) {
      this.queue.add(TextType, { speech: "Finished.", speechRate: this.config?.speechRate }, this.config);
    }

    this.prerendered = true;
    this.queue.setConfig('options', this.config.options);
    return this.queue;
  }

  make_scale_text(
    channel?: string,
    i?: number
  ) {
    if (i === undefined) {
      return this.streams.map((stream) => {
        return stream.make_scale_text(channel)
      }).flat();
    } else {
      return this.streams[i]?.make_scale_text(channel);
    }
  }

  // needs test
  async prerenderScale(channel: string, i: number) {
    let scaleQueue = (this.make_scale_text(channel, i) || []).map((d) => d.description).flat();
    this.scaleQueue = new AudioGraphQueue();
    this.scaleQueue.addMulti(scaleQueue, { ...this.config, tick: null });
    return this.scaleQueue;
  }

  async playScaleDescription(i: number, channel: string) {
    await this.prerenderScale(channel, i);
    await this.scaleQueue?.play();
  }
  async stopScaleDescription() {
    this.scaleQueue?.stop();
  }

  async playQueue() {
    if (!this.prerendered) await this.prerender();
    await this.queue?.play();
  }

  async stopQueue() {
    this.queue?.stop();
  }

  destroy() {
    this.queue = this.queue.destroy();
  }
}

export class OverlayStream {
  overlays: UnitStream[];
  playing: boolean;
  prerendered: boolean;
  config: ConfigInterface;
  name!: string;
  title!: string;
  description!: string;
  queue!: AudioGraphQueue;
  duration!: number;

  constructor() {
    this.overlays = [];
    this.playing = false;
    this.prerendered = false;
    this.config = {};
    this.name;
  }

  setName(name: string) {
    this.name = name;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setDescription(desc: string) {
    this.description = desc;
  }

  addStream(stream: UnitStream) {
    this.overlays.push(stream);
  }

  addStreams(streams: UnitStream[]) {
    this.overlays.push(...streams);
  }

  setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  setFilters(audioFilters: string[]) {
    this.overlays.forEach((s: UnitStream) => {
      s.setFilters(audioFilters);
    });
  }

  async prerender(subpart?: boolean) {
    this.queue = new AudioGraphQueue();
    // order: scale > title--repeated

    // main title & description
    if (!subpart) {
      if (this.title && !this.config.skipTitle) {
        this.queue.add(TextType, { speech: this.title, speechRate: this.config?.speechRate }, this.config);
      } else if (this.name && !this.config.skipTitle) {
        this.queue.add(TextType, { speech: this.name, speechRate: this.config?.speechRate }, this.config);
      }
      if (this.description && !this.config.skipDescription) {
        this.queue.add(TextType, { speech: this.description, speechRate: this.config?.speechRate }, this.config);
      }
    }


    // overlay descriptions
    if (this.overlays.length > 1) {
      if (!subpart && !this.config.skipStartSpeech) {
        this.queue.add(TextType, { speech: `This sonification has ${this.overlays.length} overlaid streams.`, speechRate: this.config?.speechRate });

        let oi = 1;
        let titles_queues = [], scales_queues = [], scale_count = 0;
        for (const stream of this.overlays) {

          let title_queue = new AudioGraphQueue();

          if ((stream.title || stream.name) && !stream.config.skipTitle) {
            title_queue.add(TextType, { speech: `The ${toOrdinalNumbers(oi)} overlay stream is about ${(stream.title || stream.name)}. `, speechRate: this.config?.speechRate }, stream.config);
          }
          if (stream.description && !stream.config.skipDescription) {
            title_queue.add(TextType, { speech: stream.description, speechRate: this.config?.speechRate }, stream.config);
          }
          titles_queues.push(title_queue);

          let scale_text = stream.make_scale_text().filter((d) => d);
          if (!stream.config.skipScaleSpeech && scale_text.length > 0) {
            let scales_queue = new AudioGraphQueue()
            scales_queue.add(TextType, { speech: `This stream has the following sound mappings. `, speechRate: this.config?.speechRate }, stream.config);
            scales_queue.addMulti(scale_text, { ...stream.config, tick: null });
            scale_count++;
            scales_queues.push(scales_queue);
          }
          oi++;
        }
        if (scale_count > 1) {
          for (let i = 0; i < oi - 1; i++) {
            if (titles_queues[i]) this.queue.addQueue(titles_queues[i]);
            if (scales_queues[i]) this.queue.addQueue(scales_queues[i]);
          }
        } else {
          for (let i = 0; i < oi - 1; i++) {
            if (titles_queues[i]) this.queue.addQueue(titles_queues[i]);
          }
          for (let i = 0; i < oi - 1; i++) {
            if (scales_queues[i]) this.queue.addQueue(scales_queues[i]);
          }
        }
      }
    }

    let overlays: PreGraphUnit[] = [];
    this.overlays.forEach(async (stream: UnitStream) => {
      overlays.push(await stream.prerender());
    });

    this.queue.add(ToneOverlaySeries,
      { overlays }
    );

    this.prerendered = true;

    return this.queue;
  }


  make_scale_text(channel?: string, i?: number) {
    if (i !== undefined) {
      let stream = this.overlays[i];
      if (stream && !stream.config.skipScaleSpeech) return stream.make_scale_text(channel);
      else return [];
    } else {
      return this.overlays.map((stream) => {
        if (!stream.config.skipScaleSpeech) return stream.make_scale_text(channel);
        else return [];
      }).flat();
    }
  }

  async playQueue() {
    if (!this.prerendered) await this.prerender();
    this.queue?.play();
  }

  async stopQueue() {
    this.queue?.stop();
  }
}

export class UnitStream {
  instrument_type: string;
  stream: AudioGraph;
  option: RecordObject;
  scales: ScaleCollection;
  config: ConfigInterface;
  name!: string;
  title!: string;
  description!: string;
  ramp: { [key: string]: RampType | undefined };
  audioFilters!: string[];
  duration!: number;

  constructor(
    instrument_type: string,
    stream: AudioGraph,
    scales: ScaleCollection,
    opt: RecordObject
  ) {
    this.instrument_type = instrument_type;
    this.stream = stream;
    this.option = opt || {};
    this.scales = scales;
    this.config = {};
    this.name;
    this.ramp = {};
  }
  setTitle(t: string) {
    this.title = t;
  }
  setDescription(d: string) {
    this.description = d;
  }
  setName(name: string) {
    this.name = name;
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

  make_tone_text(i: number) {
    let text = [];
    let identifier = (i !== undefined ? `The ${toOrdinalNumbers(i + 1)}` : `This`)
    if (this.name) text.push({ type: TextType, speech: `${identifier} stream is for ${this.name} layer and has a tone of`, speechRate: this.config?.speechRate });
    else text.push({ type: TextType, speech: `${identifier} stream has a tone of`, speechRate: this.config?.speechRate });
    text.push({ type: ToneType, sound: { pitch: DefaultFrequency, duration: 0.2, start: 0 }, instrument_type: this.instrument_type });
    return text;
  }

  make_scale_text(channel?: string) {
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

  async prerender(): Promise<PreGraphUnit> {
    return {
      instrument_type: this.instrument_type,
      sounds: this.stream,
      continued: this.option?.is_continued,
      relative: this.option?.relative,
      filters: this.audioFilters,
      ramp: this.ramp,
      duration: this.duration
    };
  }
}

export class SpeechStream {
  stream: AudioGraphSpeech;
  config: ConfigInterface;

  constructor(stream: AudioGraphSpeech) {
    this.stream = stream;
    this.config = {};
  }

  setConfig(key: string, value: any) {
    this.config[key] = value;
  }

  make_scale_text() {
    return [];
  }

  async prerender(): Promise<PreGraphSpeech> {
    let text: PreGraphSpeech = [];
    for (const stream of this.stream) {
      if (stream.speech) {
        text.push({
          type: TextType,
          speech: stream.speech,
          speechRate: stream.speechRate ?? this.config?.speechRate
        } as PreGraphSpeechItem);
      }
    }
    return text;
  }
}
