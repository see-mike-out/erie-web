import {
  AudioGraphSpeech,
  ConfigInterface,
  PreGraphSpeech,
  PreGraphSpeechItem
} from '../types';

export class SpeechStream {
  id: string;
  stream: AudioGraphSpeech;
  config: ConfigInterface;

  constructor(id: string, stream: AudioGraphSpeech) {
    this.id = id;
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
          speech: stream.speech,
          speechRate: stream.speechRate ?? this.config?.speechRate,
          language: stream.language,
          pitch: stream.pitch,
          loudness: stream.loudness
        } as PreGraphSpeechItem);
      }
    }
    return text;
  }
}
