import {
  SequenceStream,
  OverlayStream,
  SpeechStream,
  compileSingleLayerAuidoGraph,
  tidyUpScaleDefinitions,
  getChannelType,
  makeScales,
  UnitStream,
  StreamingStream,
  isSequenceStreamObject,
  isStreamingStreamObject,
  compileSequnceStream,
  compileStreamingStream
} from './compile';
import {
  normalizeSpecification,
  isRepeatedStream,
  isStreamingStream,
} from "./normalize";
import {
  deepcopy,
  toHashedObject
} from "./util";
import { getData } from "./data";
import {
  TopLevelSpec,
  ConfigInterface,
  LoadedDatasets,
  AudioGraphSpeechItem,
  StreamingSpec
} from './types';

// global event
let isRecorded = false;
export function readyRecording() {
  document?.body?.addEventListener("erieOnRecorderReady", (e) => {
    isRecorded = true;
  });
}

export async function compileAudioGraph(audio_spec: TopLevelSpec, options: ConfigInterface) {
  let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = await normalizeSpecification(audio_spec, options);
  let is_streaming = isStreamingStream(audio_spec);
  sequenceConfig.is_streaming = is_streaming;

  // handle ordering
  let ordering = audio_spec?.ordering;
  if (!ordering) {
    // get default ordering
  }

  let sequence = !is_streaming ? await compileSequnceStream(
    audio_spec,
    normalized,
    datasets,
    tick,
    scaleDefinitions,
    sequenceConfig,
    synths,
    samplings,
    waves
  ) : await compileStreamingStream(
    audio_spec as StreamingSpec,
    normalized,
    tick,
    scaleDefinitions,
    sequenceConfig,
    {
      playback: (audio_spec as StreamingSpec).playback,
      notify: (audio_spec as StreamingSpec).notify,
      test_data: datasets
    }
  )

  // 5. Rregistrations
  sequence.setSampling(toHashedObject(samplings, 'name'));
  sequence.setSynths(toHashedObject(synths, 'name'));
  sequence.setWaves(toHashedObject(waves, 'name'));

  // 6. Configs
  if (audio_spec?.config?.recording) {
    sequence.setConfig("recording", true);
  }

  if (audio_spec.config) {
    Object.keys(audio_spec.config).forEach((key) => {
      if (audio_spec.config?.[key]) {
        sequence.setConfig(key, audio_spec.config[key]);
      }
    });
  }
  if (typeof window !== 'undefined'
    && 'erieRecorderReady' in window
    && window?.erieRecorderReady) {
    isRecorded = true;
  }
  sequence.setConfig('isRecorded', isRecorded);
  sequence.setConfig('options', options);
  return sequence;
}