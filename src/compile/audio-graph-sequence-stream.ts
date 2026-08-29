import {
  Chimes,
  chimeSynth,
  getChimeBeat
} from '../chimes';
import {
  AudioGraphQueue
} from '../player/audio-graph-player';
import { compileDescriptionMarkup } from '../scale';
import {
  ConfigInterface,
  TextType,
  ToneSeries,
  HashedObject,
  SynthNormed,
  SampledToneNormed,
  WaveNormed,
  OrderSpecNormed,
  OrderingTypeMarkup,
  OrderingTypeSound,
  OrderingTypeRepeat,
  RoleAnnounceKeyScStopPlay,
  RoleDescription,
  RoleTitle,
  RoleName,
  RoleScaleOverview,
  RoleScaleDescription,
  PAN_X_chn,
  PAN_chn,
  RoleLength,
  SpeechNotifyItemSpec,
  ToneType,
  RoleRepeatTitle,
  ParsedScaleFunction,
  DEF_SPEECH_RATE,
  TU_SEC,
  DescriptionMarkupQueueTextItem,
} from '../types';
import {
  toOrdinalNumbers,
  deepcopy
} from '../util';
import { OverlayStream } from './audio-graph-overlay-stream';
import { SpeechStream } from './audio-graph-speech-stream';
import { UnitStream } from './audio-graph-unit-stream';

export class SequenceStream {
  streams: Array<UnitStream | OverlayStream>;
  playing: boolean;
  prerendered: boolean;
  config: ConfigInterface;
  synths: HashedObject<SynthNormed>;
  samplings: HashedObject<SampledToneNormed>;
  waves: HashedObject<WaveNormed>;
  name!: string;
  title!: string;
  description!: string;
  introStream?: SpeechStream;
  queue!: AudioGraphQueue | void;
  scaleQueue!: AudioGraphQueue;
  ordering!: OrderSpecNormed

  constructor() {
    this.streams = [];
    this.playing = false;
    this.prerendered = false;
    this.config = {};
    this.synths = {};
    this.samplings = {};
    this.waves = {};
    this.ordering = [];
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

  setIntroStream(stream: SpeechStream) {
    this.introStream = stream;
  }

  setOrdering(ordering: OrderSpecNormed) {
    this.ordering = ordering;
  }

  async prerender() {
    // only based on the order
    if (!this.ordering) {
      console.error("No ordering information available")
    }

    // initialize
    this.queue = new AudioGraphQueue();
    this.queue.setSampling(this.samplings);
    this.queue.setSynths(this.synths);
    this.queue.setWaves(this.waves);

    let totalStreams: Array<UnitStream | OverlayStream | SpeechStream> = [this.introStream, ...this.streams].filter(d => d !== undefined);

    let chiime_used = false;

    // queue registration
    for (const orderItem of this.ordering) {
      let group_id = orderItem.group_id;
      let speechOptions = 'speechOption' in orderItem ? {
        speechRate: orderItem.speechOption?.speechRate ?? this.config?.speechRate,
        pitch: orderItem.speechOption?.pitch,
        language: orderItem.speechOption?.language,
        loudness: orderItem.speechOption?.loudness
      } : {};

      if ('text' in orderItem && orderItem.text) {
        this.queue.add(TextType, group_id, {
          speech: orderItem.text,
          ...speechOptions
        }, this.config);
      } else if (orderItem.type === OrderingTypeRepeat) {
        let streamId = orderItem.specifier.streamId
        let streams = totalStreams.filter((s) => (s.id === streamId) || s?.id.startsWith(streamId + "-repeat-")) as UnitStream[];
        let ri = 1;
        for (const stream of streams) {
          for (const repeatOrderIteam of orderItem.repeat) {
            if (repeatOrderIteam.type === OrderingTypeMarkup) {
              if (repeatOrderIteam.specifier.role === RoleRepeatTitle) {
                // todo
                // @ts-ignore
                let scale: ParsedScaleFunction = () => { };
                scale.properties = { channel: '', encodingType: 'static', title: stream.name, index: ri };
                let title = compileDescriptionMarkup(
                  (repeatOrderIteam.markup as string) ?? `Stream <index>. <title>.`,
                  '',
                  scale, speechOptions.speechRate ?? this.config.speechRate ?? DEF_SPEECH_RATE,
                  this.config.timeUnit?.unit ?? TU_SEC)[0] as DescriptionMarkupQueueTextItem;
                // if the above part fails, it will cause an error;
                this.queue.add(TextType, group_id, {
                  speech: title.text as string,
                  ...speechOptions
                }, this.config);
              }
            } else if (repeatOrderIteam.type === OrderingTypeSound) {
              // todo
              if (repeatOrderIteam.notify?.beforePlay || repeatOrderIteam.notify?.beforePlay === undefined) {
                if (repeatOrderIteam.notify === undefined || repeatOrderIteam.notify?.beforePlay === undefined || repeatOrderIteam.notify.beforePlay === true) {
                  chiime_used = true;
                  this.queue.add(ToneSeries, group_id, {
                    instrument_type: 'chimeSynth',
                    sounds: Chimes.beforePlay,
                    continued: false,
                    relative: false,
                    filters: [],
                    ramp: {},
                    duration: getChimeBeat(2.15)
                  }, this.config);
                } else if ('speech' in repeatOrderIteam.notify.beforePlay) {
                  let notifyOptions = deepcopy(speechOptions);
                  Object.assign(notifyOptions, repeatOrderIteam.notify.beforePlay)
                  this.queue.add(TextType, group_id, { ...(notifyOptions as SpeechNotifyItemSpec) }, this.config);
                } else if ('sample' in repeatOrderIteam.notify.beforePlay) {
                  let sample_id = 'sample_before_play_' + group_id;
                  this.queue.add(ToneType, group_id, {
                    sound: { start: 0, duration: -1 },
                    instrument_type: sample_id,
                    duration: -1
                  }, { ...this.config, dynamic_duration: true });
                  if (!(sample_id in this.samplings)) {
                    this.samplings[sample_id] = {
                      name: sample_id,
                      sample: { mono: repeatOrderIteam.notify.beforePlay.sample }
                    };
                  }
                }
              }
              if (stream instanceof UnitStream) {
                let prerenderedUnitStream = await stream.prerender();
                console.log(stream, prerenderedUnitStream)
                this.queue.add(ToneSeries, group_id, prerenderedUnitStream, { ...this.config, ...stream.config });
              }
              if (repeatOrderIteam.notify?.afterPlay || repeatOrderIteam.notify?.afterPlay === undefined) {
                if (repeatOrderIteam.notify === undefined || repeatOrderIteam.notify?.afterPlay === undefined || repeatOrderIteam.notify.afterPlay === true) {
                  chiime_used = true;
                  this.queue.add(ToneSeries, group_id, {
                    instrument_type: 'chimeSynth',
                    sounds: Chimes.afterPlay,
                    continued: false,
                    relative: false,
                    filters: [],
                    ramp: {},
                    duration: getChimeBeat(2.15)
                  }, this.config);
                } else if ('speech' in repeatOrderIteam.notify.afterPlay) {
                  let notifyOptions = deepcopy(speechOptions);
                  Object.assign(notifyOptions, repeatOrderIteam.notify.afterPlay)
                  this.queue.add(TextType, group_id, { ...(notifyOptions as SpeechNotifyItemSpec) }, this.config);
                } else if ('sample' in repeatOrderIteam.notify.afterPlay) {
                  let sample_id = 'sample_after_play_' + group_id;
                  this.queue.add(ToneType, group_id, {
                    sound: { start: 0, duration: -1 },
                    instrument_type: sample_id,
                    duration: -1
                  }, { ...this.config, dynamic_duration: true });
                  if (!(sample_id in this.samplings)) {
                    this.samplings[sample_id] = {
                      name: sample_id,
                      sample: { mono: repeatOrderIteam.notify.afterPlay.sample }
                    };
                  }
                }
              }
            }

          }
          ri++;
        }
      } else if ('specifier' in orderItem) {
        let streamId = orderItem.specifier.streamId
        let stream = totalStreams.filter((s) => (s.id === streamId) || s?.id.startsWith(streamId + "-repeat-"))[0];
        if (!stream && streamId) {
          console.error("Stream ID provided, but the stream cannot be found.");
        }
        let overlayId = orderItem.specifier.overlayId, overlay!: UnitStream;
        if (overlayId && stream instanceof OverlayStream) {
          overlay = stream.overlays.filter((s) => s.id === overlayId)[0];
        }
        if (!overlay && overlayId) {
          console.error("Overlay ID provided, but the overlay cannot be found.");
        }
        if (orderItem.type === OrderingTypeMarkup) {
          if (orderItem.specifier.role === RoleAnnounceKeyScStopPlay) {
            this.queue.add(TextType, group_id, {
              speech: `To stop playing the sonification, press the X key. `,
              ...speechOptions
            }, this.config);
          } else if (orderItem.specifier.role === RoleLength) {
            if (!stream) {
              this.queue.add(TextType, group_id, { speech: `This sonification has ${this.streams.length} parts. `, ...speechOptions }, this.config);
            }
          } else if (orderItem.specifier.role === RoleDescription) {
            if (!stream && orderItem.specifier.streamId === undefined) {
              // main 
              if (this.description) this.queue.add(TextType, group_id, { speech: this.description, ...speechOptions }, this.config);
            } if (stream && stream.id.includes('-repeat-')) {
              // only repeated
              if (this.description) this.queue.add(TextType, group_id, { speech: this.description, ...speechOptions }, this.config);
            } else if (stream && 'description' in stream && stream.description) {
              // intro
              this.queue.add(TextType, group_id, { speech: stream.description, ...speechOptions }, this.config);
            }
          } else if (orderItem.specifier.role === RoleTitle) {
            if (!stream && orderItem.specifier.streamId === undefined) {
              // main 
              if (this.title) this.queue.add(TextType, group_id, { speech: this.title, ...speechOptions }, this.config);
            } else if (stream && stream.id.includes('-repeat-')) {
              if (this.title) this.queue.add(TextType, group_id, { speech: this.title, ...speechOptions }, this.config);
            } else if (stream && 'title' in stream && stream.title) {
              this.queue.add(TextType, group_id, { speech: this.description, ...speechOptions }, this.config);
            }
          } else if (orderItem.specifier.role === RoleName) {
            if (!stream && orderItem.specifier.streamId === undefined) {
              // main 
              if (this.name) this.queue.add(TextType, group_id, { speech: `This sonification is about ${this.name}. `, ...speechOptions }, this.config);
            } else if (stream && stream.id.includes('-repeat-')) {
              if (this.name) this.queue.add(TextType, group_id, { speech: `This sonification is about ${this.name}. `, ...speechOptions }, this.config);
            } else if (stream && 'name' in stream && stream.name) {
              this.queue.add(TextType, group_id, { speech: `This sonification is about ${stream.name}. `, ...speechOptions }, this.config);
            }
          } else if (orderItem.specifier.role === RoleScaleOverview) {
            if (stream) {
              this.queue.add(TextType, group_id, { speech: "This stream has the following sound mappings.", ...speechOptions }, this.config);
            }
          } else if (orderItem.specifier.role === RoleScaleDescription) {
            if (stream && orderItem.specifier.channel) {
              // todo: provide custom markup? here? or when updating scales? maybe here... is
              let scaleDesc = stream.make_scale_text(orderItem.specifier.channel).filter((d) => d);
              if (scaleDesc[0].description) {
                for (const descItem of scaleDesc[0].description) {
                  this.queue.add(descItem.type, group_id, { ...descItem, ...speechOptions }, this.config);
                }
              }
            } else if (stream) {
              let scaleDesc = stream.make_scale_text().filter((d) => d);
              for (const channelDesc of scaleDesc) {
                if (channelDesc.description) {
                  for (const descItem of channelDesc.description) {
                    this.queue.add(descItem.type, group_id, { ...descItem, ...speechOptions }, this.config);
                  }
                }
              }
            }
          }
        } else if (orderItem.type === OrderingTypeSound) {
          if (orderItem.notify?.beforePlay || orderItem.notify?.beforePlay === undefined) {
            if (orderItem.notify === undefined || orderItem.notify?.beforePlay === undefined || orderItem.notify.beforePlay === true) {
              chiime_used = true;
              this.queue.add(ToneSeries, group_id, {
                instrument_type: 'chimeSynth',
                sounds: Chimes.beforePlay,
                continued: false,
                relative: false,
                filters: [],
                ramp: {},
                duration: getChimeBeat(2.15)
              }, this.config);
            } else if ('speech' in orderItem.notify.beforePlay) {
              let notifyOptions = deepcopy(speechOptions);
              Object.assign(notifyOptions, orderItem.notify.beforePlay)
              this.queue.add(TextType, group_id, { ...(notifyOptions as SpeechNotifyItemSpec) }, this.config);
            } else if ('sample' in orderItem.notify.beforePlay) {
              let sample_id = 'sample_before_play_' + group_id;
              this.queue.add(ToneType, group_id, {
                sound: { start: 0, duration: -1 },
                instrument_type: sample_id,
                duration: -1
              }, { ...this.config, dynamic_duration: true });
              this.samplings[sample_id] = {
                name: sample_id,
                sample: { mono: orderItem.notify.beforePlay.sample }
              };
            }
          }
          if (stream instanceof UnitStream) {
            let prerenderedUnitStream = await stream.prerender()
            this.queue.add(ToneSeries, group_id, prerenderedUnitStream, { ...this.config, ...stream.config });
          } else if (stream instanceof OverlayStream) {
            let prerenderedOverlayStream = await stream.prerender(true) // only overlays
            this.queue.addQueue(group_id, prerenderedOverlayStream);
          }
          if (orderItem.notify?.afterPlay || orderItem.notify?.afterPlay === undefined) {
            if (orderItem.notify === undefined || orderItem.notify?.afterPlay === undefined || orderItem.notify.afterPlay === true) {
              chiime_used = true;
              this.queue.add(ToneSeries, group_id, {
                instrument_type: 'chimeSynth',
                sounds: Chimes.afterPlay,
                continued: false,
                relative: false,
                filters: [],
                ramp: {},
                duration: getChimeBeat(2.15)
              }, this.config);
            } else if ('speech' in orderItem.notify.afterPlay) {
              let notifyOptions = deepcopy(speechOptions);
              Object.assign(notifyOptions, orderItem.notify.afterPlay)
              this.queue.add(TextType, group_id, { ...(notifyOptions as SpeechNotifyItemSpec) }, this.config);
            } else if ('sample' in orderItem.notify.afterPlay) {
              let sample_id = 'sample_after_play_' + group_id;
              this.queue.add(ToneType, group_id, {
                sound: { start: 0, duration: -1 },
                instrument_type: sample_id,
                duration: -1
              }, { ...this.config, dynamic_duration: true });
              this.samplings[sample_id] = {
                name: sample_id,
                sample: { mono: orderItem.notify.afterPlay.sample }
              };
            }
          }
        }
      }
    }

    // settings registration
    if (this.config) {
      Object.keys(this.config).forEach((key) => {
        this.queue?.setConfig(key, this.config[key]);
      })
    }

    if (chiime_used) {
      this.synths.chimeSynth = chimeSynth;
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
    this.queue = this.queue?.destroy();
  }
}

export function isSequenceStreamObject(o: any): o is SequenceStream {
  return o?.constructor?.name === SequenceStream.name;
}