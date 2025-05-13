import { Chimes, chimeSynth, getChimeBeat } from '../chimes';
import {
  AudioGraphQueue,
  isAudioGraphQueue
} from '../player/audio-graph-player';
import { compileDescriptionMarkup, parseDescriptionMarkup } from '../scale';
import {
  AfterAll,
  AfterThis,
  BeforeAll,
  BeforeThis,
  ConfigInterface,
  ForceRepeatScale,
  PlayAt,
  TextType,
  ToneSeries,
  PreGraphUnit,
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
                let prerenderedUnitStream = await stream.prerender()
                this.queue.add(ToneSeries, group_id, prerenderedUnitStream, this.config);
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
              for (const descItem of scaleDesc[0].description) {
                this.queue.add(descItem.type, group_id, { ...descItem, ...speechOptions }, this.config);
              }
            } else if (stream) {
              let scaleDesc = stream.make_scale_text().filter((d) => d);
              for (const channelDesc of scaleDesc) {
                for (const descItem of channelDesc.description) {
                  this.queue.add(descItem.type, group_id, { ...descItem, ...speechOptions }, this.config);
                }
              }
            }
          }
        } else if (orderItem.type === OrderingTypeSound) {
          // todo
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
            this.queue.add(ToneSeries, group_id, prerenderedUnitStream, this.config);
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
    this.queue.setSampling(this.samplings);
    this.queue.setSynths(this.synths);
    this.queue.setWaves(this.waves);

    // LEGACY! NEEDS TO REMOVE BEFORE VERSIONING
    // // 2. making queues
    // let titles_queues: AudioGraphQueue[] = [],
    //   scales_queues: Array<AudioGraphQueue> = [],
    //   audio_queues: Array<AudioGraphQueue | PreGraphUnit> = [],
    //   scale_count = 0,
    //   announced_scales: string[] = [];

    // let multiSeq = this.streams.length > 1;
    // if (multiSeq && !this.config.skipSquenceIntro) {
    //   this.queue.add(TextType, 0, { speech: `This sonification sequence consists of ${this.streams.length} parts. `, speechRate: this.config?.speechRate }, this.config);
    // }

    // let oi = 0;

    // for (const stream of this.streams) {
    //   let _c = deepcopy(this.config || {});
    //   Object.assign(_c, stream.config || {});
    //   let speechRate = _c.speechRate;
    //   if (multiSeq) {
    //     let title_queue = new AudioGraphQueue();
    //     if ((stream.title || stream.name) && !stream.config.skipSequenceTitle) {
    //       title_queue.add(TextType, 0, { speech: `Stream ${oi + 1}. ${(stream.title || stream.name)}. `, speechRate }, _c);
    //     } else if (!stream.config.skipSequenceTitle) {
    //       title_queue.add(TextType, 0, { speech: `Stream ${oi + 1}. `, speechRate }, _c);
    //     }
    //     if (stream.description && !stream.config.skipSequenceDescription) {
    //       title_queue.add(TextType, 0, { speech: stream.description, speechRate }, _c);
    //     }
    //     titles_queues.push(title_queue);
    //   } else {
    //     titles_queues.push(new AudioGraphQueue());
    //   }

    //   let determiner = 'This';
    //   if (multiSeq) determiner = "The " + toOrdinalNumbers(oi + 1);

    //   if (!('overlays' in stream) && !_c.skipScaleSpeech) {
    //     let scale_text = stream.make_scale_text().filter((d) => d);
    //     let scales_to_announce = [];
    //     let forceRepeat = _c[ForceRepeatScale];
    //     if (!forceRepeat) forceRepeat = false;
    //     for (const item of scale_text) {
    //       if (item.description) {
    //         if (item.id && !announced_scales.includes(item.id)) {
    //           scales_to_announce.push(...item.description);
    //           announced_scales.push(item.id);
    //         } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
    //           scales_to_announce.push(...item.description);
    //         }
    //       }
    //     }

    //     if (scales_to_announce.length > 0) {
    //       let scales_queue = new AudioGraphQueue();
    //       scales_queue.add(TextType, 0, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, _c);
    //       scales_queue.addMulti(scales_to_announce, { ..._c, tick: null });
    //       scale_count++;
    //       scales_queues.push(scales_queue);
    //     }
    //   } else if ('overlays' in stream) {
    //     // each overlay title
    //     if (!_c.skipTitle) titles_queues[oi].add(TextType, 0, { speech: `${determiner} stream has ${stream.overlays.length} overlaid sounds. `, speechRate }, _c);

    //     let forceRepeat = _c[ForceRepeatScale];
    //     if (!forceRepeat) forceRepeat = false;
    //     let scale_init_text_added = false;
    //     let scales_queue = new AudioGraphQueue();

    //     stream.overlays.forEach((overlay, li) => {
    //       let __c = deepcopy(_c || {});
    //       Object.assign(__c, overlay.config || {});
    //       let speechRate = __c.speechRate
    //       if (__c.playRepeatSequenceName !== false && overlay.title && !__c.skipOverlayTitle) {
    //         titles_queues[oi].add(TextType, 0, { speech: `Overlay ${li + 1}. ${overlay.title}. `, speechRate }, __c);
    //       } else if (__c.playRepeatSequenceName !== false && overlay.name && !__c.skipOverlayTitle) {
    //         titles_queues[oi].add(TextType, 0, { speech: `Overlay ${li + 1}. ${overlay.name}. `, speechRate }, __c);
    //       }
    //       if (overlay.description && !__c.skipOverlayDescription) {
    //         titles_queues[oi].add(TextType, 0, { speech: overlay.description, speechRate }, __c);
    //       }

    //       let scale_text = stream.make_scale_text(undefined, li).filter((d) => d);
    //       let scales_to_announce = [];
    //       for (const item of scale_text) {
    //         if (item.description) {
    //           if (item.id && !announced_scales.includes(item.id)) {
    //             scales_to_announce.push(...item.description);
    //             announced_scales.push(item.id);
    //           } else if (forceRepeat === true || forceRepeat?.[item.channel] === true) {
    //             scales_to_announce.push(...item.description);
    //           }
    //         }
    //       }

    //       if (scales_to_announce.length > 0) {
    //         if (!forceRepeat && !scale_init_text_added) {
    //           scales_queue.add(TextType, 0, { speech: `${determiner} stream has the following sound mappings. `, speechRate }, __c);
    //           scale_init_text_added = true;
    //         } else {
    //           let determiner2 = 'This';
    //           if (multiSeq && li > 1) determiner2 = "The " + toOrdinalNumbers(li);
    //           scales_queue.add(TextType, 0, { speech: `${determiner2} overlay has the following sound mappings. `, speechRate }, __c);
    //         }
    //         scales_queue.addMulti(scales_to_announce, { ...__c, tick: null });
    //         scale_count++;
    //       }
    //     });
    //     if (scales_queue.queue.length > 0) {
    //       scales_queues.push(scales_queue);
    //     }
    //     scale_count++;
    //   }
    //   oi++;
    // }

    // // 3. Prerender subqueues
    // for (const stream of this.streams) {
    //   let prerender_series = await stream.prerender(true);
    //   audio_queues.push(prerender_series);
    // }

    // // 4. queueing
    // let streamIndex = 0;
    // let preaddPos = this.queue.queue.length || 0;
    // let preadd: AudioGraphQueue[] = [], postadd: AudioGraphQueue[] = [];
    // for (const stream of this.streams) {
    //   let _c = deepcopy(this.config || {});
    //   Object.assign(_c, stream.config || {});
    //   let speechRate = _c.speechRate

    //   if (titles_queues[streamIndex]) this.queue.addQueue(0, titles_queues[streamIndex]);

    //   let scalePlayAt = _c[PlayAt];
    //   if (scalePlayAt === BeforeAll) {
    //     if (scales_queues[streamIndex]) preadd.push(scales_queues[streamIndex]);
    //   } else if (scalePlayAt === BeforeThis || !scalePlayAt) {
    //     if (scales_queues[streamIndex]) this.queue.addQueue(0, scales_queues[streamIndex]);
    //   }


    //   let prerender_series = audio_queues[streamIndex];
    //   if (!_c.skipStartPlaySpeech) {
    //     this.queue.add(TextType, 0, { speech: `Start playing. `, speechRate }, _c);
    //   }
    //   if (isAudioGraphQueue(prerender_series)) {
    //     this.queue.addQueue(0, prerender_series);
    //   } else {
    //     this.queue.add(ToneSeries, 0, prerender_series, _c);
    //   }

    //   if (scalePlayAt === AfterAll) {
    //     if (scales_queues[streamIndex]) postadd.push(scales_queues[streamIndex]);
    //   } else if (scalePlayAt === AfterThis) {
    //     if (scales_queues[streamIndex]) this.queue.addQueue(0, scales_queues[streamIndex]);
    //   }

    //   streamIndex++;
    // }

    // if (preadd.length > 0) {
    //   for (const pq of preadd) {
    //     this.queue.addQueue(0, pq, preaddPos);
    //     preaddPos += 1;
    //   }
    // }

    // if (postadd.length > 0) {
    //   for (const pq of postadd) {
    //     this.queue.addQueue(0, pq);
    //   }
    // }

    // if (!this.config.skipFinishSpeech) {
    //   this.queue.add(TextType, 0, { speech: "Finished.", speechRate: this.config?.speechRate }, this.config);
    // }

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