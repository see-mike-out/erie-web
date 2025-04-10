import { UnitStream } from './audio-graph-unit-stream';
import { isOverlayStreamObject, OverlayStream } from './audio-graph-overlay-stream';
import {
  makeRepeatStreamTree,
  postprocessRepeatStreams
} from './audio-graph-repeat-stream';
import { Def_tone } from '../normalize';
import {
  deepcopy,
  unique,
  listString
} from "../util";
import {
  transformData,
  orderArray,
  getTransformers
} from "../data";
import {
  NOM,
  ORD,
  TMP,
  REPEAT_chn,
  TIMBRE_chn,
  TIME2_chn,
  TIME_chn,
  SEQUENCE,
  REL,
  ScaleDescriptionOrder,
  TickObject,
  DataOrderingItem,
  InternalData,
  BeforeAll,
  PlayAt,
  ScaleCollection,
  ConfigInterface,
  NormalizedSingleStream,
  RampType,
  Glyph,
  RepeatGraphItem,
  RepeatMembershipItem,
  OVERLAY,
  MembershipMarker,
  RepeatTree,
  RepeatTreeLeaf,
  RepeatTreeNonLeaf,
  PAN_X_chn,
  PAN_Y_chn,
  PAN_Z_chn,
  PAN_RADIUS_chn,
  PAN_POLAR_chn,
  PAN_AZIMUTH_chn,
  TransformerFunction,
  Datum
} from "../types";
import { makeScaleDescription } from "../scale";
import {
  Def_Tick_Duration,
  Def_Tick_Duration_Beat,
  Def_Tick_Interval,
  Def_Tick_Interval_Beat
} from '../tick';
import { makeGlyph } from './audio-graph-make-glyph';
import { orderData } from './audio-graph-order-data';

export async function compileSingleLayerAuidoGraph(
  audio_spec: NormalizedSingleStream,
  _data: Datum[],
  config: ConfigInterface | undefined,
  tickDef: { [key: string]: TickObject },
  common_scales: ScaleCollection
) {
  let layer_spec = {
    name: audio_spec.name,
    encoding: audio_spec.encoding,
    tone: audio_spec.tone || { type: Def_tone }
  };

  let audioFilters = audio_spec.tone?.filter || null;
  if (audioFilters) audioFilters = [...audioFilters];

  if (!_data || !layer_spec.encoding) {
    console.warn("No proper layer spec provided.")
    return undefined;
  }

  // transformations
  let forced_dimensions: string[] = Object.keys(layer_spec.encoding).map((d) => {
    let enc = layer_spec.encoding[d];
    if (enc.type && [NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    } else if (d === REPEAT_chn) {
      return enc.field;
    }
  }).filter((d) => d !== undefined).flat();

  let data: InternalData = !config?.is_streaming ? transformData(_data, [...(audio_spec.common_transform || []), ...(audio_spec.transform || [])], forced_dimensions) : [];
  let dataInfo = !config?.is_streaming ? deepcopy(data.tableInfo) : {};
  let transformer: TransformerFunction = config?.is_streaming ? getTransformers(audio_spec) : (d) => d;

  // encoding properties
  let encoding = layer_spec.encoding;
  let tone_spec = layer_spec.tone;
  if (tone_spec.type === "default") {
    tone_spec = {
      type: Def_tone,
      continued: tone_spec.continued,
      hasBaseTone: tone_spec.hasBaseTone
    }
  }
  let channels = Object.keys(encoding).filter((c) => ![TIME_chn, TIME2_chn, TIMBRE_chn].includes(c));
  let hasTime2 = (encoding[TIME_chn] && encoding[TIME2_chn]);
  let is_repeated = encoding[REPEAT_chn] !== undefined;
  let has_repeat_speech = is_repeated && encoding[REPEAT_chn].speech;
  if (has_repeat_speech === undefined) has_repeat_speech = true;
  if (is_repeated && encoding[REPEAT_chn]?.field === undefined) {
    console.error("Repeat field must be provided.")
  }
  let _rf: string | string[] | undefined = REPEAT_chn in encoding ? encoding[REPEAT_chn].field as string | string[] : undefined;
  if (typeof _rf === 'string') _rf = [_rf];
  let repeat_field: string[] | undefined = _rf;
  let _rd: typeof SEQUENCE | typeof OVERLAY | Array<typeof SEQUENCE | typeof OVERLAY> | undefined = encoding[REPEAT_chn]?.by;
  let repeat_direction: Array<typeof SEQUENCE | typeof OVERLAY> = [];
  if (is_repeated && repeat_field) {
    if (_rd === undefined) _rd = [SEQUENCE];
    else if (typeof _rd === 'string') _rd = [_rd];
    repeat_direction = _rd;
    if (repeat_field?.length !== repeat_direction.length) {
      if (repeat_direction.length == 1) {
        repeat_direction = repeat_field.map(() => repeat_direction[0]);
      } else {
        console.error("The repeat direction is not matched with the repeat field(s)")
      }
    }
  }

  // data sort
  // tiem channel can only have a string field
  let data_order: DataOrderingItem[] = [], data_sorter!: Function;
  if (!config?.is_streaming) {
    data_order = orderData(
      encoding,
      data,
      {
        is_repeated,
        repeat_field
      }
    );
    data = orderArray(data, data_order);
  } else {
    data_order = orderData(
      encoding,
      [],
      {
        is_repeated: false,
        repeat_field: []
      }
    );
    data_sorter = (d: InternalData): InternalData => {
      return orderArray(d, data_order);
    }
  }

  delete data.tableInfo;

  // treat repeat
  let audio_graph: Glyph[] = [],
    repeated_graph: RepeatGraphItem[] = [],
    repeated_graph_map: { [key: string]: number } = {},
    repeat_values!: RepeatMembershipItem[],
    repeat_level: number = 0;

  if (is_repeated && repeat_field) {
    repeat_level = repeat_field.length;
    repeat_values = unique(data.map((d) => repeat_field.map((k) => d[k]).join("_$_")))
      .map((d) => ({
        value_keys: d.split("_$_"),
        membership: [] as MembershipMarker[]
      }));
    repeat_values.forEach((d) => {
      let g: RepeatGraphItem = {
        name: listString(d.value_keys, ", ", true),
        membership: [] as MembershipMarker[],
        glyphs: []
      };
      repeat_field.forEach((f, i) => {
        g.membership.push({ key: f, value: d.value_keys[i] } as MembershipMarker);
      });
      d.membership = g.membership;
      repeated_graph.push(g);
      repeated_graph_map[d.value_keys.join("&")] = repeated_graph.length - 1
    });
  }

  // get scales
  let scales: ScaleCollection = {};
  for (const channel in encoding) {
    let enc = encoding[channel];
    if (enc.scale?.id) {
      scales[channel] = common_scales[enc.scale.id];
    }
  }

  // relativity
  let relative_stream = encoding[TIME_chn].scale?.timing === REL || scales.time?.properties?.timing === REL;

  // ramping
  let ramp: { [key: string]: RampType | undefined } = {};
  for (const channel in encoding) {
    ramp[channel] = encoding[channel].ramp;
  }

  // tick
  let hasTick = encoding[TIME_chn].tick !== undefined, tick!: TickObject;
  if (hasTick) {
    let tickItem = encoding[TIME_chn].tick;
    if (tickItem?.name && tickDef[tickItem.name]) {
      tick = tickDef[tickItem.name];
    } else if (tickItem) {
      tick = tickItem;
    }
    tick = deepcopy(tick);

    // time unit conversion
    if (common_scales.__beat) {
      tick.interval = tick.interval ? common_scales.__beat.converter(tick.interval) : Def_Tick_Interval_Beat;
      tick.band = tick.band ? common_scales.__beat.converter(tick.band) : Def_Tick_Duration_Beat;
    } else {
      if (!tick.interval) tick.interval = Def_Tick_Interval;
      if (!tick.band) tick.band = Def_Tick_Duration;
    }
  }

  if (common_scales) {
    // generate scale text
    let scaleDescOrder = config?.scaleDescriptionOrder || ScaleDescriptionOrder;
    let __config = deepcopy(config || {});
    __config.isRepeated = is_repeated;
    __config.repeatField = repeat_field;
    for (const chn of scaleDescOrder) {
      if (scales[chn]) {
        __config.aggregated = encoding[chn].aggregate ? true : false;
        __config.binned = encoding[chn].binned;
        scales[chn].description = makeScaleDescription(scales[chn], encoding[chn], dataInfo, tick, tone_spec, __config, common_scales.__beat);
      }
    }
  }

  // generate audio graphs
  let streaming_encoder!: Function;
  let total_duration = 0, repeat_total_duration = Array(repeated_graph.length).fill(0);
  if (!config?.is_streaming) {
    for (const i in data) {
      if (i === 'tableInfo') continue;
      let datum = data[i];
      let glyphs = makeGlyph(
        i as `${number}`,
        datum,
        tone_spec,
        channels,
        encoding,
        scales,
        hasTime2,
        total_duration,
        {
          is_repeated,
          repeat_field,
          repeated_graph_map,
          repeated_graph,
          repeat_total_duration
        }
      )
      audio_graph.push(...glyphs.glyphs);
      total_duration = glyphs.total_duration;
      repeated_graph = glyphs.repeated_graph;
      repeat_total_duration = glyphs.repeat_total_duration;
    }
  } else {
    streaming_encoder = (streaming_data: InternalData) => {
      let streaming_graph: Glyph[] = [];
      for (const i in streaming_data) {
        if (i === 'tableInfo') continue;
        let datum = streaming_data[i];
        let glyphs = makeGlyph(
          i as `${number}`,
          datum,
          tone_spec,
          channels,
          encoding,
          scales,
          hasTime2,
          total_duration,
          { // ignored
            is_repeated,
            repeat_field,
            repeated_graph_map,
            repeated_graph,
            repeat_total_duration
          }
        )
        streaming_graph.push(...glyphs.glyphs);
      }
      return streaming_graph;
    }
  }
  let is_continued = tone_spec.continued === undefined ? false : tone_spec.continued;
  let has_base_tone = tone_spec.hasBaseTone ?? false;
  let instrument_type = tone_spec.type || 'default'

  // repetition control
  let stream: UnitStream | Array<UnitStream | OverlayStream>;
  if (is_repeated) {
    let repeat_streams = makeRepeatStreamTree(0, repeat_values, repeat_direction);
    repeated_graph.forEach((g, i) => {
      let r_stream = new UnitStream(instrument_type, g.glyphs, scales, { is_continued, has_base_tone, relative: relative_stream });
      r_stream.duration = repeat_total_duration[i];
      Object.keys(config || {}).forEach(key => {
        r_stream.setConfig(key, config?.[key]);
      });
      if (g.name) r_stream.setName(g.name);
      if (has_repeat_speech) r_stream.setConfig("playRepeatSequenceName", true);
      if (i > 0) {
        r_stream.setConfig("skipScaleSpeech", true);
        r_stream.setConfig("skipStartSpeech", true);
      }
      if (i < repeated_graph.length - 1) {
        r_stream.setConfig("skipFinishSpeech", true);
      }
      if (hasTick) {
        r_stream.setConfig("tick", tick);
      }
      r_stream.setRamp(ramp);

      let rs_accessor: RepeatTree | RepeatTree[] = repeat_streams;
      for (let i = 0; i < repeat_level; i++) {
        rs_accessor = (rs_accessor as RepeatTreeNonLeaf).nodes;
        let member = g.membership[i];
        for (let j = 0; j < rs_accessor.length; j++) {
          if (rs_accessor[j].parent_value == member.value) {
            rs_accessor = rs_accessor[j];
            break;
          }
        }
      }
      (rs_accessor as RepeatTreeLeaf).nodes.push(r_stream);
    });

    // post_processing
    let processed_repeat_stremas: Array<UnitStream | OverlayStream> = postprocessRepeatStreams(repeat_streams);
    processed_repeat_stremas.forEach((s, i) => {
      if (!s) { console.warn("empty repeat stream", s); }
      if (has_repeat_speech && s.setConfig) s.setConfig("playRepeatSequenceName", true);
      if (i > 0) {
        s.setConfig("skipScaleSpeech", true);
        s.setConfig("skipStartSpeech", true);
      } else {
        s.setConfig(PlayAt, BeforeAll);
      }
      if (i < processed_repeat_stremas.length - 1) {
        s.setConfig("skipFinishSpeech", true);
      }
      if (hasTick) {
        s.setConfig("tick", tick);
      }
      if ('overlays' in s && isOverlayStreamObject(s)) {
        Object.assign(s.config, s.overlays[0].config);
        s.duration = Math.max(...s.overlays.map((d) => d.duration));
        s.overlays.forEach((o, i) => {
          if (o.setConfig) {
            o.setConfig("playRepeatSequenceName", false);
            if (i == 0) {
              o.setConfig("skipScaleSpeech", false);
              o.setConfig("skipStartSpeech", false);
            } else {
              o.setConfig("skipScaleSpeech", true);
              o.setConfig("skipStartSpeech", true);
            }
            o.setConfig("skipFinishSpeech", true);
          }
        });
        if (s.setConfig) {
          s.setConfig("skipScaleSpeech", true);
          s.setConfig("skipTitle", true);
          s.setConfig("skipStartSpeech", true);
          s.setConfig("playRepeatSequenceName", true);
        }
        s.setName(listString(s.overlays.map((d) => d.name), ", ", true))
      }
      if (audioFilters) s.setFilters(audioFilters);
    });
    stream = processed_repeat_stremas;
  }
  // if not repeated
  else {
    stream = new UnitStream(instrument_type, audio_graph, scales, { is_continued, relative: relative_stream, has_base_tone });
    if (!config?.is_streaming) stream.duration = total_duration as number;
    Object.keys(config || {}).forEach(key => {
      (stream as UnitStream).setConfig(key, config?.[key]);
    });
    if (hasTick) {
      stream.setConfig("tick", tick);
    }
    if (layer_spec.name) stream.setName(layer_spec.name);
    if (audioFilters) stream.setFilters(audioFilters);
    stream.setRamp(ramp);
    if (audio_spec.description) stream.setDescription(audio_spec.description);
  }
  return { stream, scales, transformer, streaming_encoder, data_sorter };
}