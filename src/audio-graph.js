import { SequenceStream, OverlayStream, SpeechStream } from './compile/audio-graph-datatype';
import { compileSingleLayerAuidoGraph } from './compile/audio-graph-queue-compile';
import { normalizeSpecification, isRepeatedStream } from "./compile/audio-graph-normalize";
import { deepcopy } from "./util/audio-graph-util";
import { getDataWrap } from "./data/audio-graph-data-import";
import { toHashedObject } from './util/audio-graph-format-util';
import { tidyUpScaleDefinitions, getChannelType, makeScales } from './compile/audio-graph-update-scale';

// global event
let isRecorded = false;
export function readyRecording() {
  document?.body?.addEventListener("erieOnRecorderReady", (e) => {
    isRecorded = true;
  });
}

export async function compileAuidoGraph(audio_spec, options) {
  let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = await normalizeSpecification(audio_spec);
  // 1. load datasets first! && filling missing data type
  let loaded_datasets = {};
  let scalesToRemove = [];
  for (const stream of normalized) {
    if (stream.stream) {
      await getDataWrap(stream.stream.data, loaded_datasets, datasets);

      let untyped_channels = [];
      Object.keys(stream.stream.encoding).forEach((channel) => {
        if (!stream.stream.encoding[channel].type) untyped_channels.push(channel);
      });
      if (untyped_channels.length > 0) {
        await getChannelType(loaded_datasets, stream.stream, untyped_channels)
      }
      scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, sequenceConfig));
    } else if (stream.overlay) {
      for (const overlay of stream.overlay) {
        await getDataWrap(overlay.data, loaded_datasets, datasets);
        let untyped_channels = [];
        Object.keys(overlay.encoding).forEach((channel) => {
          if (!overlay.encoding[channel].type) untyped_channels.push(channel);
        });
        if (untyped_channels.length > 0) {
          await getChannelType(loaded_datasets, overlay, untyped_channels)
        }
      }
      let c = {};
      Object.assign(c, sequenceConfig);
      Object.assign(c, stream.config || {});
      scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, c));
    }
  }

  // 2. tidy up scales
  let scaleHash = toHashedObject(scaleDefinitions, 'id');
  for (const sid of scalesToRemove) {
    delete scaleHash[sid];
  }

  // 3. make scales
  let scales = await makeScales(scaleHash, normalized, loaded_datasets, sequenceConfig);

  // 4. make streams
  let sequence = new SequenceStream();
  if (audio_spec?.config?.recording) {
    sequence.setConfig("recording", true);
  }

  // 4a. regiester stuff
  sequence.setSampling(toHashedObject(samplings, 'name'));
  sequence.setSynths(toHashedObject(synths, 'name'));
  sequence.setWaves(toHashedObject(waves, 'name'));

  // 4b. make streams
  let sequenceScaleConsistency = audio_spec.config.sequenceScaleConsistency !== undefined ? audio_spec.config.sequenceScaleConsistency : true;

  let si = 0, isSeq = normalized?.length > 1;
  for (const stream of normalized) {
    if (stream.intro) {
      let speeches = [stream.intro.title, stream.intro.description].filter(d => d !== undefined);
      let sStream = new SpeechStream(speeches.map((d) => ({ speech: d })));
      if (audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          sStream.setConfig(key, audio_spec.config[key]);
        });
      }
      sequence.setIntroStream(sStream);
    } else if (stream.stream) {
      let is_repeated = isRepeatedStream(stream.stream);
      let data = deepcopy(loaded_datasets[stream.stream.data.name]);
      let slag = await compileSingleLayerAuidoGraph(stream.stream, data, audio_spec.config, tick, scales)
      if (!is_repeated) {
        sequence.addStream(slag.stream);
      } else {
        sequence.addStreams(slag.stream);
      }
      if (audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          sequence.setConfig(key, audio_spec.config[key]);
        });
      }
      if (stream.stream.config) {
        Object.keys(stream.stream.config).forEach((key) => {
          sequence.setConfig(key, stream.stream.config[key]);
        });
      }
      if (stream.stream.title) sequence.setTitle(stream.stream.title);
      if (stream.stream.description) sequence.setDescription(stream.stream.description);
    } else if (stream.overlay) {
      let overlays = new OverlayStream();
      let i = 0;
      for (const overlay of stream.overlay) {
        let data = deepcopy(loaded_datasets[overlay.data.name]);

        let config = deepcopy(audio_spec.config);
        Object.assign(config, overlay.config);

        let overlayStrm = await compileSingleLayerAuidoGraph(overlay, data, config, tick, scales)

        if (overlay.name) overlayStrm.stream.setName(overlay.name);
        if (overlay.title) overlayStrm.stream.setTitle(overlay.title);
        if (overlay.description) overlayStrm.stream.setDescription(overlay.description);

        overlays.addStream(overlayStrm.stream);
        i++;
      }
      overlays.setName(stream.name);
      overlays.setTitle(stream.title);
      overlays.setDescription(stream.description);
      if (audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          overlays.setConfig(key, audio_spec.config[key]);
        });
      }
      if (stream.overlay.config) {
        Object.keys(stream.overlay.config).forEach((key) => {
          overlays.setConfig(key, stream.overlay.config[key]);
        });
      }
      sequence.addStream(overlays);
    }
    si++;
  }
  if (audio_spec.config) {
    Object.keys(audio_spec.config).forEach((key) => {
      sequence.setConfig(key, audio_spec.config[key]);
    });
  }
  if (window?.erieRecorderReady) {
    isRecorded = true;
  }
  sequence.setConfig('isRecorded', isRecorded);
  sequence.setConfig('options', options);
  return sequence;
}