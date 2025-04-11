import { getData } from "../data";
import { isRepeatedStream } from "../normalize";
import { AudioGraphSpeechItem, ConfigNormed, DataNormed1, DatasetSpecItemNormed, HashedObject, LoadedDatasets, NormalizedStreamItem, OrderSpecNormed, ParsedScaleDefinition, SampledToneNormed, SynthNormed, TickNormed, TopLevelSpec, WaveNormed } from "../types";
import { deepcopy, toHashedObject } from "../util";
import { OverlayStream } from "./audio-graph-overlay-stream";
import { compileSingleLayerAuidoGraph } from "./audio-graph-queue-compile";
import { SequenceStream } from "./audio-graph-sequence-stream";
import { SpeechStream } from "./audio-graph-speech-stream";
import { UnitStream } from "./audio-graph-unit-stream";
import { getChannelType, makeScales, tidyUpScaleDefinitions } from "./audio-graph-update-scale";

export async function compileSequnceStream(
  audio_spec: TopLevelSpec,
  normalized: NormalizedStreamItem[],
  datasets: HashedObject<DatasetSpecItemNormed>,
  tick: HashedObject<TickNormed>,
  scaleDefinitions: ParsedScaleDefinition[],
  sequenceConfig: ConfigNormed,
  synths: SynthNormed[],
  samplings: SampledToneNormed[],
  waves: WaveNormed[],
  ordering_normalized: OrderSpecNormed // todo (here, just pass. do stuff at the prerendering step)
): Promise<SequenceStream> {

  // 1. load datasets first! && filling missing data type
  let loaded_datasets: LoadedDatasets = {};
  let scalesToRemove = [];
  for (const stream of normalized) {
    if ('stream' in stream && stream.stream) {
      await getData(stream.stream.data as DataNormed1, loaded_datasets, datasets);

      let untyped_channels: string[] = [];
      Object.keys(stream.stream.encoding).forEach((channel) => {
        if (!stream.stream.encoding[channel].type) untyped_channels.push(channel);
      });
      if (untyped_channels.length > 0) {
        await getChannelType(loaded_datasets, stream.stream, untyped_channels)
      }
      scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, sequenceConfig));
    } else if ('overlay' in stream && stream.overlay) {
      for (const overlay of stream.overlay) {
        await getData(overlay.data as DataNormed1, loaded_datasets, datasets);
        let untyped_channels: string[] = [];
        Object.keys(overlay.encoding).forEach((channel) => {
          if (!overlay.encoding[channel].type) untyped_channels.push(channel);
        });
        if (untyped_channels.length > 0) {
          await getChannelType(loaded_datasets, overlay, untyped_channels)
        }
      }
      let c: ConfigNormed = {};
      Object.assign(c, sequenceConfig);
      // Object.assign(c, stream.config || {});
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
  // 4b. make streams
  let si = 0;
  for (const stream of normalized) {
    if ('intro' in stream && stream.intro) {
      let speeches: (string | undefined)[] = [stream.intro.title, stream.intro.description].filter(d => d !== undefined);
      let sStream = new SpeechStream(stream.id, speeches.map((d) => ({ speech: d } as AudioGraphSpeechItem)));
      if ('config' in audio_spec && audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          if (audio_spec.config?.[key]) {
            sStream.setConfig(key, audio_spec.config[key]);
          }
        });
      }
      sequence.setIntroStream(sStream);
    } else if ('stream' in stream && stream.stream) {
      let is_repeated = isRepeatedStream(stream.stream);
      let data = deepcopy(loaded_datasets[(stream.stream.data as DataNormed1).name]);
      // slag = single layer audio graph
      let slag = await compileSingleLayerAuidoGraph(stream.stream, data, audio_spec.config, tick, scales)

      if (!is_repeated && slag?.stream) {
        sequence.addStream(slag?.stream as UnitStream);
      } else if (slag?.stream) {
        sequence.addStreams(slag?.stream as Array<UnitStream | OverlayStream>);
      }
      if (audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          if (audio_spec.config?.[key]) {
            sequence.setConfig(key, audio_spec.config[key]);
          }
        });
      }
      if (stream.stream.config) {
        Object.keys(stream.stream.config).forEach((key) => {
          if (stream.stream.config) sequence.setConfig(key, stream.stream.config[key]);
        });
      }
      if (stream.stream.title) sequence.setTitle(stream.stream.title);
      if (stream.stream.description) sequence.setDescription(stream.stream.description);
    } else if ('overlay' in stream && stream.overlay) {
      let overlays = new OverlayStream(stream.id);

      // registering
      overlays.setSampling(toHashedObject(samplings, 'name'));
      overlays.setSynths(toHashedObject(synths, 'name'));
      overlays.setWaves(toHashedObject(waves, 'name'));

      let i = 0;
      for (const overlay of stream.overlay) {
        let data = deepcopy(loaded_datasets[(overlay.data as DataNormed1).name]);

        let config = deepcopy(audio_spec.config as ConfigNormed);
        Object.assign(config, overlay.config);

        let overlayStrm = await compileSingleLayerAuidoGraph(overlay, data, config, tick, scales)

        if (overlayStrm) {
          if (overlay.name) (overlayStrm.stream as UnitStream).setName(overlay.name);
          if (overlay.title) (overlayStrm.stream as UnitStream).setTitle(overlay.title);
          if (overlay.description) (overlayStrm.stream as UnitStream).setDescription(overlay.description);
          overlays.addStream(overlayStrm.stream as UnitStream);
        }
        i++;
      }
      if (stream.name) overlays.setName(stream.name);
      if (stream.title) overlays.setTitle(stream.title);
      if (stream.description) overlays.setDescription(stream.description);
      if (audio_spec.config) {
        Object.keys(audio_spec.config).forEach((key) => {
          if (audio_spec.config?.[key]) {
            overlays.setConfig(key, audio_spec.config[key]);
          }
        });
      }
      // if (stream.config) {
      //   Object.keys(stream.config).forEach((key) => {
      //     overlays.setConfig(key, stream.config[key]);
      //   });
      // }
      sequence.addStream(overlays);
    }
    si++;
  }

  sequence.setOrdering(ordering_normalized);

  return sequence;
}