import { ToneType, TextType, ToneSeries, ToneOverlaySeries, AudioGraphQueue, Pause } from '../player/audio-graph-player';
import { DefaultFrequency } from '../player/audio-graph-player-proto';
import { toOrdinalNumbers } from '../util/audio-graph-format-util';
import { jType } from '../util/audio-graph-typing-util';

export const SeqStrm = 'SequenceStream', OverStrm = 'OverlayStream', UnitStrm = 'UnitStream', IntroStrm = 'IntroStream', AGQueue = 'AudioGraphQueue';

export class SequenceStream {
  constructor() {
    this.streams = [];
    this.playing = false;
    this.status = undefined;
    this.prerendered = false;
    this.config = {};
    this.synths = [];
    this.samplings = [];
  }

  setTitle(t) {
    this.title = t;
  }
  setDescription(d) {
    this.description = d;
  }
  addStream(stream) {
    this.streams.push(stream);
  }
  addStreams(streams) {
    this.streams.push(...streams);
  }

  setSampling(samplings) {
    this.samplings = samplings;
  }

  setSynths(synths) {
    this.synths = synths;
  }
  setWaves(waves) {
    this.waves = waves;
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  setIntroStream(stream) {
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

    // 1. main title && description
    // in case of a separate intro stream
    if (this.introStream) {
      this.introStream.stream.forEach((d) => {
        this.queue.add(TextType, { speech: d.speech, speechRate: this.config?.speechRate }, this.config);
      })
    } else {
      if (this.title && !this.config.skipTitle) {
        this.queue.add(TextType, { speech: `This sonification is about ${this.title || this.name}. `, speechRate: this.config?.speechRate }, this.config);
      }
      if (this.description && !this.config.skipDescription) {
        this.queue.add(TextType, { speech: this.description, speechRate: this.config?.speechRate }, this.config);
      }
    }
    let multiSeq = this.streams.length > 1;
    if (multiSeq && !this.config.skipSquenceIntro) {
      if (!this.config.skipStartSpeech) {
        this.queue.add(TextType, { speech: `This sonification consists of ${this.streams.length} streams. `, speechRate: this.config?.speechRate }, this.config);
      }
    }
    let streamIndex = 0;
    let oi = 1;
    let titles_queues = [], scales_queues = [], scale_count = 0;
    for (const stream of this.streams) {
      let title_queue = new AudioGraphQueue()
      if ((stream.title || stream.name) && !stream.config.skipTitle) {
        title_queue.add(TextType, { speech: `The ${toOrdinalNumbers(oi)} stream is about ${(stream.title || stream.name)}. `, speechRate: this.config?.speechRate }, stream.config);
      }
      if (stream.description && !stream.config.skipDescription) {
        title_queue.add(TextType, { speech: stream.description, speechRate: this.config?.speechRate }, stream.config);
      }
      titles_queues.push(title_queue);
      let scales_queue = new AudioGraphQueue()
      if (!stream.config.skipScaleSpeech) {
        let determiner = 'This';
        if (multiSeq && oi > 1) determiner = toOrdinalNumbers(oi);
        scales_queue.add(TextType, { speech: `${determiner} stream has the following sound mappings. `, speechRate: this.config?.speechRate }, stream.config);
        let scale_text = stream.make_scale_text();
        scales_queue.addMulti(scale_text, { ...stream.config, tick: null });
        scale_count++;
      } else if (jType(stream) === OverStrm) {
        scale_count++;
      }
      scales_queues.push(scales_queue);
      oi++;
    }
    let howToPlayTitleScaleSpeech;
    if (scale_count > 1) {
      howToPlayTitleScaleSpeech = 'allEach';
    } else {
      howToPlayTitleScaleSpeech = 'commonScale';
    }
    for (const stream of this.streams) {
      if (this.streams.length == 1 && jType(stream) === OverStrm) {
        // skip scale text;
        let prerender_series = await stream.prerender(true);
        this.queue.addMulti(prerender_series.queue, stream.config);
      } else {
        if (howToPlayTitleScaleSpeech === 'allEach') {
          if (titles_queues[streamIndex]) this.queue.addQueue(titles_queues[streamIndex]);
          if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
        } else if (howToPlayTitleScaleSpeech === 'commonScale') {
          if (scales_queues[streamIndex]) this.queue.addQueue(scales_queues[streamIndex]);
          if (titles_queues[streamIndex]) this.queue.addQueue(titles_queues[streamIndex]);
        }
        if (!stream.config.skipStartSpeech || (!multiSeq && stream.config.skipStartSpeech && jType(stream) === 'UnitStream')) {
          this.queue.add(TextType, { speech: "Press X key to stop. Now playing the sonification. ", speechRate: this.config?.speechRate }, stream.config);
        }
        let prerender_series = await stream.prerender(true);
        if (jType(prerender_series) === 'AudioGraphQueue') {
          if (stream.config.playRepeatSequenceName) stream.config.skipTitle = true;
          this.queue.addMulti(prerender_series.queue, stream.config);
        } else {
          this.queue.add(ToneSeries, prerender_series, stream.config);
        }
      }
      streamIndex++;
    }

    if (!this.config.skipFinishSpeech) {
      this.queue.add(TextType, { speech: "Finished.", speechRate: this.config?.speechRate }, this.config);
    }
    this.prerendered = true;
    return this.queue;
  }

  make_scale_text(i) {
    if (i === undefined) {
      return this.streams.map((stream) => {
        return stream.make_scale_text()
      }).flat();
    } else {
      return this.streams[i]?.make_scale_text();
    }
  }

  async playQueue() {
    if (!this.prerendered) await this.prerender();
    await this.queue?.play();
  }

  async stopQueue() {
    this.queue?.stop();
  }

  getRecording() {
    return this.queue?.getRecording();
  }
  hasRecording() {
    return this.queue?.hasRecording;
  }
}

export class OverlayStream {
  // todoL change to queue format
  constructor() {
    this.overlays = [];
    this.playing = false;
    this.status = undefined;
    this.prerendered = false;
    this.individual_playing = [];
    this.config = {};
    this.name;
  }

  setName(name) {
    this.name = name;
  }

  setTitle(title) {
    this.title = title;
  }

  setDescription(desc) {
    this.description = desc;
  }

  addStream(stream) {
    this.overlays.push(stream);
  }

  addStreams(streams) {
    this.overlays.push(...streams);
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  async prerender(subpart) {
    this.queue = new AudioGraphQueue();
    // order: scale > title--repeated
    if (this.config.recording) this.queue.setConfig("recording", true)

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
      this.queue.add(TextType, { speech: `This sonification has ${this.overlays.length} overlaid streams.`, speechRate: this.config?.speechRate });
      let oi = 1;
      let titles_queues = [], scales_queues = [], scale_count = 0;
      for (const stream of this.overlays) {
        let title_queue = new AudioGraphQueue()
        if ((stream.title || stream.name) && !stream.config.skipTitle) {
          title_queue.add(TextType, { speech: `The ${toOrdinalNumbers(oi)} stream is about ${(stream.title || stream.name)}. `, speechRate: this.config?.speechRate }, stream.config);
        }
        if (stream.description && !stream.config.skipDescription) {
          title_queue.add(TextType, { speech: stream.description, speechRate: this.config?.speechRate }, stream.config);
        }
        titles_queues.push(title_queue);
        let scales_queue = new AudioGraphQueue()
        if (!stream.config.skipScaleSpeech) {
          scales_queue.add(TextType, { speech: `This stream has the following sound mappings. `, speechRate: this.config?.speechRate }, stream.config);
          let scale_text = stream.make_scale_text().filter((d) => d);
          if (scale_text.length > 0) {
            scales_queue.addMulti(scale_text, { ...stream.config, tick: null });
          }
          scale_count++;
        }
        scales_queues.push(scales_queue);
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
    if (!this.config.skipStartSpeech) {
      this.queue.add(TextType, { speech: "Press X key to stop. Now playing the sonification. ", speechRate: this.config?.speechRate }, this.config);
    }

    let overlays = [];
    this.overlays.forEach(async (stream) => overlays.push(await stream.prerender()))
    this.queue.add(ToneOverlaySeries,
      { overlays }
    );

    this.prerendered = true;

    return this.queue;
  }

  make_scale_text() {
    return this.overlays.map((stream) => {
      if (!stream.config.skipScaleSpeech) return stream.make_scale_text()
      else return [];
    }).flat();
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
  constructor(instrument_type, stream, scales, opt) {
    this.instrument_type = instrument_type;
    this.stream = stream;
    this.option = opt || {};
    this.instrument;
    this.scales = scales;
    this.config = {};
    this.name;
  }
  setTitle(t) {
    this.title = t;
  }
  setDescription(d) {
    this.description = d;
  }
  setName(name) {
    this.name = name;
  }
  setConfig(key, value) {
    this.config[key] = value;
  }
  setFilters(audioFilters) {
    this.audioFilters = audioFilters
  }

  make_tone_text(i) {
    let text = [];
    let identifier = (i !== undefined ? `The ${toOrdinalNumbers(i + 1)}` : `This`)
    if (this.name) text.push({ type: TextType, speech: `${identifier} stream is for ${this.name} layer and has a tone of`, speechRate: this.config?.speechRate });
    else text.push({ type: TextType, speech: `${identifier} stream has a tone of`, speechRate: this.config?.speechRate });
    text.push({ type: ToneType, sound: { pitch: DefaultFrequency, duration: 0.2, start: 0 }, instrument_type: this.instrument_type });
    return text;
  }

  make_scale_text() {
    let scales = this.scales;
    let text = Object.keys(scales).map((channel) => { return scales[channel]?.description; })
    text = text.flat();
    let tick = text.filter(d => d?.isTick), nonTick = text.filter(d => !d?.isTick);
    let desc = [...nonTick, ...tick];
    return desc;
  }

  async prerender() {
    return {
      instrument_type: this.instrument_type, sounds: this.stream, continued: this.option?.is_continued, relative: this.option?.relative,
      filters: this.audioFilters
    };
  }
}

export class SpeechStream {
  constructor(stream) {
    this.stream = stream;
    this.config = {};
  }

  setConfig(key, value) {
    this.config[key] = value;
  }

  make_scale_text() {
    return [];
  }

  async prerender() {
    let text = [];
    for (const stream of this.stream) {
      if (stream.speech) {
        text.push({ type: TextType, speech: stream.speech, speechRate: this.config?.speechRate });
      }
    }
    return text;
  }
}