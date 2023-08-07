import { notifyStop, notifyPause, notifyResume } from "../util/audio-graph-speech";
import {
  setPlayerEvents,
  clearPlayerEvents,
  playAbsoluteDiscreteTonesAlt,
  playAbsoluteContinuousTones,
  playSingleTone,
  playSingleSpeech,
  playRelativeDiscreteTonesAndSpeeches,
  playPause,
  playAbsoluteSpeeches,
  makeContext,
  Tone, Speech, DefaultFrequency,
  ErieGlobalControl
} from "./audio-graph-player-proto";

import { SupportedInstruments, loadSamples } from "./audio-graph-instrument-sample";
import { deepcopy } from "../util/audio-graph-util";
import { DefaultChannels } from "../scale/audio-graph-scale-constant";

export const TextType = 'text',
  ToneType = 'tone',
  ToneSeries = 'tone-series',
  LegendType = 'legend',
  ToneSpeechSeries = 'tone-speech-series',
  Pause = 'pause',
  ToneOverlaySeries = 'tone-overlay-series';
const Stopped = 'stopped',
  Paused = 'paused',
  Playing = 'playing',
  Finished = 'finished';

const Types = [TextType, ToneType, ToneSeries, ToneOverlaySeries, Pause, ToneSpeechSeries, LegendType];

export class AudioGraphQueue {
  constructor() {
    this.queue = [];
    this.state = Finished;
    this.playAt;
    this.config = {};
    this.stopEvents = {};
    this.sampledInstruments = [];
    this.sampledInstrumentSources = {};
    this.chunks;
    this.mediaRecorder;
    this.mediaStream;
    this.export = [];
    this.samplings = {};
    this.synths = {};
    this.waves = {};
  }

  setConfig(key, value) {
    this.config[key] = value;
  }


  setSampling(samplings) {
    this.samplings = deepcopy(samplings);
  }

  setSynths(synths) {
    this.synths = deepcopy(synths);
  }

  setWaves(waves) {
    this.waves = deepcopy(waves);
  }

  isSupportedInst(k) {
    return SupportedInstruments.includes(k);
  }
  isSampling(k) {
    return this.samplings?.[k] !== undefined;
  }
  isSynth(k) {
    return this.synths?.[k] !== undefined;
  }
  isWave(k) {
    return this.waves?.[k] !== undefined;
  }

  add(type, info, lineConfig) {
    let checkInstrumentSampling = new Set(), userSampledInstruments = new Set();
    if (Types.includes(type)) {
      let item = {
        type,
        config: lineConfig
      };
      if (type === TextType) {
        item.text = info?.text || info || '';
        if (info?.speechRate) item.speechRate = info?.speechRate;
      } else if (type === ToneType) {
        item.instrument_type = info.instrument_type;
        if (this.isSupportedInst(item.instrument_type)) checkInstrumentSampling.add(item.instrument_type);
        else if (this.isSampling(item.instrument_type)) userSampledInstruments.add(item.instrument_type);
        item.start = info.sound?.start || info.start || 0;
        item.end = info.sound?.end || (item.start + (item.sound?.duration || 0.2));
        item.duration = info.sound?.duration || (item.end - item.start) || 0.2; // in seconds
        item.pitch = info.sound?.pitch || info.pitch || DefaultFrequency;
        item.detune = info.sound?.detune || info.detune || DefaultFrequency;
        item.loudness = info.sound?.loudness || info.loudness
        item.pan = info.sound?.pan || info.pan;
        item.postReverb = info.sound?.postReverb || info.postReverb || 0;
        item.timbre = info.sound?.timbre || info.timbre || info.instrument_type;
        item.tap = info.sound?.tap || info.tap;
        item.modulation = info.sound?.modulation || info.modulation || 1;
        item.harmonicity = info.sound?.harmonicity || info.harmonicity || 1;
        item.others = {};
        // custom channels;
        Object.keys(info.sound || info || {}).forEach((chn) => {
          if (!DefaultChannels.includes(chn)) {
            item.others[chn] = info.sound?.[chn] || info[chn];
          }
        });
        // filters
        item.filters = info.filters || [];
        if (this.isSupportedInst(item.timbre)) checkInstrumentSampling.add(item.timbre);
        else if (this.isSampling(item.timbre)) userSampledInstruments.add(item.timbre);
      } else if (type === ToneSeries) {
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
          if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
          else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
        });
      } else if (type === ToneOverlaySeries) {
        if (info.overlays.length > 0) {
          item.overlays = info.overlays.map((d) => {
            let o = {
              instrument_type: d.instrument_type,
              sounds: makeSingleStreamQueueValues(d.sounds),
              continued: d.continued,
              relative: d.relative,
              filters: d.filters || []
            };
            o.sounds[o.sounds.length - 1].isLast = true;
            if (this.isSupportedInst(o.instrument_type)) checkInstrumentSampling.add(o.instrument_type);
            else if (this.isSampling(o.instrument_type)) userSampledInstruments.add(o.instrument_type);
            o.sounds.forEach((sound) => {
              if (this.isSupportedInst(sound.timbre)) checkInstrumentSampling.add(sound.timbre);
              else if (this.isSampling(sound.timbre)) userSampledInstruments.add(sound.timbre);
            });
            return o;
          });
        } else {
          item.overlays = info.overlays;
        }
      } else if (type === Pause) {
        item.duration = info.duration; // in seconds
      } else if (type === LegendType) {
        Object.assign(item, info);
      }
      Array.from(checkInstrumentSampling).forEach((inst) => {
        if (!this.sampledInstruments.includes(inst)) {
          this.sampledInstruments.push(inst);
        }
      });
      Array.from(userSampledInstruments).forEach((inst) => {
        if (!this.sampledInstruments.includes(inst)) {
          this.sampledInstruments.push(inst);
        }
      });
      this.queue.push(item);
    }
  }

  addMulti(multiples, lineConfig) {
    for (const mul of multiples) {
      if (mul?.type) {
        this.add(mul.type, mul, lineConfig);
      }
    }
  }

  addQueue(queue) {
    this.queue.push(...queue.queue);
  }

  async play(i, j) {
    if (this.state !== Playing) {
      // await this.stopOtherTracks();
      await this.stopOtherTracks();
      setPlayerEvents(this, this.config);
      let queue = this.queue;
      this.playAt = 0;
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
      for (const item of queue) {
        console.log(item, this.state);
        if (this.state === Stopped || this.state === Paused) break;
        this.playAt += 1;
        await this.playLine(item, this.playAt);
      }
      this.fireStopEvent();
      clearPlayerEvents();
      this.state = Stopped;
    }
  }

  async playLine(item, lineId) {
    let config = deepcopy(this.config);
    Object.assign(config, item.config);
    if (item?.type === TextType) {
      await playSingleSpeech(item.text, config);
    } else if (item?.type === ToneType) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings)
        }
      }
      await playSingleTone(ctx, item, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters);
      ctx.close();
    } else if (item?.type === Pause) {
      await playPause(item.duration * 1000, config);
    } else if (item?.type === ToneSeries) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings)
        }
      }
      if (item.continued) {
        await playAbsoluteContinuousTones(ctx, item.sounds, config, this.synths, this.waves, item.filters);
      } else if (!item.relative) {
        await playAbsoluteDiscreteTonesAlt(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters);
      } else {
        await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters)
      }
      ctx.close();
    } else if (item?.type === ToneSpeechSeries) {
      let ctx = makeContext();
      for (const inst of this.sampledInstruments) {
        if (inst && !this.sampledInstrumentSources[inst]) {
          this.sampledInstrumentSources[inst] = await loadSamples(ctx, inst, this.samplings)
        }
      }
      await playRelativeDiscreteTonesAndSpeeches(ctx, item.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, item.filters);
      ctx.close();
    } else if (item?.type === ToneOverlaySeries) {
      // todo
      let promises = [], contexts = [];
      for (let stream of item.overlays) {
        let ctx = makeContext();
        contexts.push(ctx);
        if (stream.continued) {
          promises.push(playAbsoluteContinuousTones(ctx, stream.sounds, config, this.synths, this.waves, stream.filters));
        } else if (!stream.relative) {
          promises.push(playAbsoluteDiscreteTonesAlt(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters));
        } else {
          promises.push(playRelativeDiscreteTonesAndSpeeches(ctx, stream.sounds, config, this.sampledInstrumentSources, this.synths, this.waves, stream.filters));
        }
      }
      await Promise.all(promises);
      contexts.forEach((ctx) => ctx.close());
    }
    return;
  }

  stop() {
    // button-based stop
    // for event stop ==> audio-graph-player-proto.js
    // todo: unify these pipelines
    if (ErieGlobalControl?.type === Tone) {
      ErieGlobalControl.player.close();
    } else if (ErieGlobalControl?.type === Speech) {
      ErieGlobalControl.player.cancel();
    }
    this.state = Stopped;
    notifyStop(this.config);
    this.fireStopEvent();
    clearPlayerEvents();
    this.mediaRecorder?.stop();
  }

  pause() {
    self.state = Paused;
    notifyPause(this.config);
  }

  // todo
  async resume() {
    await notifyResume(this.config);
    return this.play(this.playAt);
  }

  fireStartEvent() {
    let playEvent = new Event("erieOnPlay");
    document.body.dispatchEvent(playEvent);
  }

  fireStopEvent() {
    let stopEvent = new Event("erieOnStopped");
    document.body.dispatchEvent(stopEvent);
  }

  // recorder (not working)
  async stopOtherTracks() {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  }
  async prepareRecorder() {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());

    let devices = await navigator.mediaDevices.enumerateDevices();
    let audioOutput = devices.find(devices => devices.kind === "audiooutput");
    if (audioOutput) {
      const constraints = {
        deviceId: {
          exact: audioOutput.deviceId
        }
      };

      navigator.webkitGetUserMedia({
        audio: constraints
      },
        (_stream) => {
          stream = _stream
        },
        (e) => {
          console.warn(e)
        });
    }

    let track = stream.getAudioTracks()[0];
    this.mediaStream = new MediaStream();
    this.mediaStream.addTrack(track);

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm; codecs=opus') ? 'audio/webm; codecs=opus' : 'audio/ogg; codecs=opus',
      bitsPerSecond: 256 * 8 * 1024
    });

    this.chunks = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      };
    }
    this.mediaRecorder.onstart = () => {
      console.log("Start sonification recording. All other tracks stoped.");
    }
    this.mediaRecorder.onstop = () => {
      track.stop();
      console.log("Finished sonification recording.");
      this.mediaStream.getAudioTracks()[0].stop();
      this.mediaStream.removeTrack(track);
      this.wrapRecording();
      this.hasRecording = true;
    }
  }

  async wrapRecording() {
    this.recordingBlob = new Blob(this.chunks, { type: "audio/mp3" });
    this.recordingBlobURL = URL.createObjectURL(this.recordingBlob);
    console.log(this.recordingBlobURL);
  }

  getRecording() {
    return this.recordingBlobURL;
  }
}


function makeSingleStreamQueueValues(sounds) {
  let queue_values = [];
  for (const sound of sounds) {
    let time = sound.start !== undefined ? sound.start : sound.time;
    let dur = sound.duration !== undefined ? sound.duration : (sound.end - time)
    let ith_q = {
      pitch: sound.pitch,
      detune: sound.detune,
      loudness: sound.loudness,
      time,
      duration: dur,
      pan: sound.pan,
      speech: sound.speech,
      language: sound.language,
      postReverb: (Math.round(sound.postReverb * 100) / 100) || 0,
      timbre: sound.timbre,
      tap: sound.tapCount || sound.tapSpeed,
      modulation: sound.modulation || 1,
      harmonicity: sound.harmonicity || 1,
      others: {}
    };
    if (sound.speech) {
      ith_q.duration = undefined;
      queue_values.hasSpeech = true;
    }
    // custom channels;
    Object.keys(sound || {}).forEach((chn) => {
      if (!DefaultChannels.includes(chn)) {
        ith_q.others[chn] = sound[chn];
      }
    });
    queue_values.push(ith_q);
  }
  queue_values = queue_values.sort((a, b) => (a.time + a.duration) - (b.time + b.duration));

  return queue_values;
}
