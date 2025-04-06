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
  PlaybackUnits
} from '../types';
import {
  toOrdinalNumbers,
  deepcopy
} from '../util';
import { UnitStream } from './audio-graph-unit-stream';

export const DefaultHistoryLimit = 100,
  DefaultHistoryQuery = PlaybackUnitDatum,
  DefaultPlaybackLimit = 10;

export class StreamingStream {
  instrument_type: string;
  is_continued: boolean;
  stream!: AudioGraph;
  scales: ScaleCollection;
  ramp: { [key: string]: RampType | undefined };
  transformer: TransformerFunction;
  duration!: number;

  name!: string;
  title!: string;
  description!: string;
  option: StreamingOption;
  config: ConfigInterface;

  audioFilters!: string[];
  synths: HashedObject<SynthNormed>;
  samplings: HashedObject<SampledToneNormed>;
  waves: HashedObject<WaveNormed>;

  history: StreamingHistoryItem[];
  current!: Datum[];
  base!: any;

  constructor(
    opt: StreamingOption
  ) {
    this.instrument_type = 'default';
    this.is_continued = false;
    this.stream;
    this.scales = {};
    this.ramp = {};
    this.transformer = (d) => d;

    this.synths = {};
    this.samplings = {};
    this.waves = {};
    this.audioFilters = [];

    this.history = [];
    this.current;
    this.base;

    this.name;
    this.option = opt || {};
    this.config = {};
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
    this.is_continued = d.option.is_continued;
    this.audioFilters = d.audioFilters;
    this.ramp = d.ramp;
    this.config = d.config;
    this.stream = d.stream;
    this.scales = d.scales;
    this.duration = d.duration;
    if (d.name) this.name = d.name;
    if (d.title) this.title = d.title;
    if (d.description) this.description = d.description;
  }

  setTransformer(f: TransformerFunction) {
    this.transformer = f;
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
    if (this.option.test_data && this.option.test_data.test) {
      await this.play(this.option.test_data.test, true)
    } else {
      console.warn("No test data is provoded")
    }
  }

  start() {
    if (this.is_continued) {
      // todo: play continued sound
    }
  }

  async play(d: Datum[], test?: boolean, playback_query?: { unit?: typeof PlaybackUnits[number], limit?: number }) {
    if (!test) {
      this.addToHistory(d, new Date());
    }
    if (this.option.playback) {
      let playback_history = this.queryHistory(playback_query?.unit, playback_query?.limit);
    }
    this.current = d;
    // todo asign values
  }

  async cancel() {

  }

  // history
  addToHistory(data: Datum[], time: Date) {
    this.history.unshift({ time, data });
    if (this.history.length > DefaultHistoryLimit) this.history.splice(0,);
  }

  queryHistory(_unit?: typeof PlaybackUnits[number], _limit?: number): Datum[] {
    let unit = _unit ?? this.option.playback?.unit ?? DefaultHistoryQuery;
    let limit = _limit ?? this.option.playback?.limit ?? DefaultPlaybackLimit;
    let condition = this.option.playback?.condition ?? ((_: any) => true);
    if (limit == 0) {
      return [];
    } else if (unit === PlaybackUnitDatum) {
      let output: Datum[] = [];
      for (const item of this.history) {
        if (output.length > limit) break;
        for (const datum of item.data) {
          if (output.length > limit) break;
          if (condition(datum)) output.push(datum);
        }
      }
      return output;
    } else if (unit === PlaybackUnitTime) {
      let time_threshold: number = (new Date().valueOf()) - limit;
      let output: Datum[] = [];
      for (const item of this.history) {
        if (item.time.valueOf() < time_threshold) break;
        for (const datum of item.data) {
          if (condition(datum)) output.push(datum);
        }
      }
      return output;
    } else {
      return this.history.slice(0, limit).map(d => d.data).flat() as Datum[];
    }
  }
}

export function isStreamingStreamObject(o: any): o is StreamingStream {
  return o?.constructor?.name === StreamingStream.name;
}