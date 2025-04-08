import {
  AudioGraphQueue
} from '../player/audio-graph-player';
import { UnitStream } from './audio-graph-unit-stream';
import {
  CompressedPreGraphItem,
  ConfigInterface,
  HashedObject,
  PreGraphUnit,
  SampledToneNormed,
  SynthNormed,
  TextType,
  ToneOverlaySeries,
  WaveNormed,
} from '../types';
import {
  deepcopy,
  toOrdinalNumbers
} from '../util';

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
  synths: HashedObject<SynthNormed>;
  samplings: HashedObject<SampledToneNormed>;
  waves: HashedObject<WaveNormed>;

  constructor() {
    this.overlays = [];
    this.playing = false;
    this.prerendered = false;
    this.config = {};
    this.name;
    this.synths = {};
    this.samplings = {};
    this.waves = {};
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


  setSampling(samplings: HashedObject<SampledToneNormed>) {
    this.samplings = deepcopy(samplings);
  }

  setSynths(synths: HashedObject<SynthNormed>) {
    this.synths = synths;
  }
  setWaves(waves: HashedObject<WaveNormed>) {
    this.waves = waves;
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

    this.queue.setSampling(this.samplings);
    this.queue.setSynths(this.synths);
    this.queue.setWaves(this.waves);

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

          let scale_text = stream.make_scale_text().filter((d) => d).map(d => d.description as CompressedPreGraphItem);
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
    for (const stream of this.overlays) {
      overlays.push(await stream.prerender());
    }

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

export function isOverlayStreamObject(o: any): o is OverlayStream {
  return o?.constructor?.name === OverlayStream.name;
}