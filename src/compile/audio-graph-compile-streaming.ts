import { getData } from "../data";
import {
  ConfigNormed,
  HashedObject,
  LoadedDatasets,
  NormalizedSingleStreamItem,
  NormalizedStreamItem,
  ParsedScaleDefinition,
  PlaybackQuery,
  RecordObject,
  REPEAT_chn,
  StreamingOptionNormed,
  StreamingSpec,
  TAPCNT_chn,
  TAPSPD_chn,
  TickNormed
} from "../types";
import {
  makeParamFilter,
  toHashedObject
} from "../util";
import { compileSingleLayerAuidoGraph } from "./audio-graph-queue-compile";
import {
  DefaultHistoryLimit,
  DefaultPlaybackLimit,
  StreamingStream
} from "./audio-graph-streaming-stream";
import { UnitStream } from "./audio-graph-unit-stream";
import {
  getChannelType,
  makeScales,
  tidyUpScaleDefinitions
} from "./audio-graph-update-scale";

export async function compileStreamingStream(
  audio_spec: StreamingSpec,
  normalized: NormalizedStreamItem[],
  tick: HashedObject<TickNormed>,
  scaleDefinitions: ParsedScaleDefinition[],
  config: ConfigNormed,
  streaming_options: StreamingOptionNormed
): Promise<StreamingStream> {
  let stream: NormalizedSingleStreamItem = normalized[0] as NormalizedSingleStreamItem;

  // encoding checks
  checkStreamingSpec(stream)

  // getting the test data
  let loaded_datasets: LoadedDatasets = {};
  if ('test_data' in streaming_options && streaming_options.test_data) {
    await getData({ name: 'test' }, loaded_datasets, streaming_options.test_data);
  }

  // for compliance (it won't really do anything)
  let scalesToRemove = [];
  let untyped_channels: string[] = [];
  Object.keys(stream.stream.encoding).forEach((channel) => {
    if (!stream.stream.encoding[channel].type) untyped_channels.push(channel);
  });
  if (untyped_channels.length > 0) {
    await getChannelType(loaded_datasets, stream.stream, untyped_channels)
  }
  scalesToRemove.push(...tidyUpScaleDefinitions(scaleDefinitions, normalized, config));

  // 2. tidy up scales
  let scaleHash = toHashedObject(scaleDefinitions, 'id');
  for (const sid of scalesToRemove) {
    delete scaleHash[sid];
  }

  // 3. make scales
  let scales = await makeScales(scaleHash, normalized, loaded_datasets, config);

  // 4. playback
  let playback: PlaybackQuery | undefined = streaming_options ? {
    speed: streaming_options.playback?.speed,
    init_by: streaming_options.playback?.init_by,
    unit: streaming_options.playback?.unit,
    limit: streaming_options.playback?.limit ?? DefaultPlaybackLimit,
    condition: streaming_options.playback?.condition ? makeParamFilter(streaming_options.playback?.condition) : (_: any) => true
  } : undefined;

  // make sequence
  let sequence = new StreamingStream({
    playback,
    notify: streaming_options.notify,
    test_data: loaded_datasets,
    save_limit: DefaultHistoryLimit
  });

  // slag = single layer audio graph
  let has_base_tone = audio_spec.tone.hasBaseTone
  let repeat = stream.stream.encoding.repeat ?? null;
  if (repeat) {
    delete stream.stream.encoding.repeat;
    sequence.setRepeat(repeat);
  }
  let slag = await compileSingleLayerAuidoGraph(stream.stream, [], { is_streaming: true, has_base_tone }, tick, scales)
  if (slag?.stream) sequence.setStream(slag?.stream as UnitStream);
  if (slag?.transformer) sequence.setTransformer(slag?.transformer);
  if (slag?.streaming_encoder) sequence.setEncoder(slag?.streaming_encoder);
  if (slag?.data_sorter) sequence.setSorter(slag?.data_sorter);

  // get base values 
  let basevalues: RecordObject = Object.keys(audio_spec.encoding).reduce((acc: RecordObject, cur: string) => {
    if (audio_spec.encoding[cur] !== undefined) acc[cur] = audio_spec.encoding[cur].value;
    return acc;
  }, {} as RecordObject);

  // get base values 
  let channelSustains: RecordObject = Object.keys(audio_spec.encoding).reduce((acc: RecordObject, cur: string) => {
    acc[cur] = audio_spec.encoding[cur].sustain ?? false;
    return acc;
  }, {} as RecordObject);

  sequence.setBase(audio_spec.tone.type, basevalues, channelSustains);

  if (stream.stream.config) {
    Object.keys(stream.stream.config).forEach((key) => {
      if (stream.stream.config) sequence.setConfig(key, stream.stream.config[key]);
    });
  }
  if (stream.stream.title) sequence.setTitle(stream.stream.title);
  if (stream.stream.description) sequence.setDescription(stream.stream.description);

  return sequence;
}

function checkStreamingSpec(spec: NormalizedStreamItem) {
  if ('overlay' in spec) {
    console.error('A streaming audio graph cannot have overlaid streams.')
  }
  if ('stream' in spec) {
    let is_continued = spec.stream.tone.continued ?? false, has_base_tone = spec.stream.tone.hasBaseTone ?? false;
    if (!is_continued && has_base_tone) {
      console.error('A streaming audio graph with a base tone must have a continuous tone. For abrupt sound changes, set "ramp" as "abrupt" per channel.');
    }
    if (is_continued && (TAPCNT_chn in spec.stream.encoding || TAPSPD_chn in spec.stream.encoding)) {
      console.error('A continuous streaming audio graph cannot have a tapping channel.');
    }
    for (const channel of Object.keys(spec.stream.encoding)) {
      const encoding = spec.stream.encoding[channel];
      if (!('value' in encoding)) {
        if (!('type' in encoding)) {
          console.error(`A streaming audio graph must have a "typed" encoding channel. See ${channel} channel.`);
        }
        if (!('scale' in encoding)) {
          console.error(`A streaming audio graph must have a "well-scaled" encoding channel. See ${channel} channel.`);
        } else if ('scale' in encoding && encoding.scale !== undefined) {
          if (!('domain' in encoding.scale)) {
            console.error(`A streaming audio graph must specify the domain for each encoding channel. See ${channel} channel.`);
          }
        }
      }
    }
  }
}