import {
  AudioGraph,
  ConfigInterface,
  PreGraphUnit,
  RampType,
  RecordObject,
  ScaleCollection,
  ToneType,
  TextType,
  DefaultFrequency
} from '../types';
import {
  toOrdinalNumbers,
  deepcopy
} from '../util';

const OmitDesc = ['time2'];

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

export function isUnitStreamObject(o: any): o is UnitStream {
  return o?.constructor?.name === UnitStream.name;
}