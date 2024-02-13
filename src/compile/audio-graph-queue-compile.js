import { OverlayStream, UnitStream } from './audio-graph-datatype';
import { makeRepeatStreamTree, postprocessRepeatStreams } from './audio-graph-repeat-stream';
import { Def_tone } from "./audio-graph-normalize";
import { jType } from "../util/audio-graph-typing-util";
import { asc, deepcopy, unique } from "../util/audio-graph-util";
import { listString } from "../util/audio-graph-format-util";
import { transformData, orderArray } from "../data/audio-graph-data-transform";
import {
  NOM, ORD, SPEECH_AFTER_chn, SPEECH_BEFORE_chn, TMP,
  REPEAT_chn, ScaleDescriptionOrder, TIMBRE_chn, TIME2_chn, TIME_chn, TapChannels, SEQUENCE, REL_TIMING
} from "../scale/audio-graph-scale-constant";
import { BeforeAll, PlayAt, makeScaleDescription } from "../scale/audio-graph-scale-desc";
import { Def_Tick_Duration, Def_Tick_Duration_Beat, Def_Tick_Interval, Def_Tick_Interval_Beat } from '../tick/audio-graph-time-tick';

export async function compileSingleLayerAuidoGraph(audio_spec, _data, config, tickDef, common_scales) {
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
  let forced_dimensions = Object.keys(layer_spec.encoding).map((d) => {
    let enc = layer_spec.encoding[d];
    if ([NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    } else if (d === REPEAT_chn) {
      return enc.field;
    } else if (!enc.aggregate) {
      return enc.field;
    }
  }).filter((d) => d).flat();

  let data;
  if (audio_spec.common_transform) {
    data = transformData(_data, [...(audio_spec.common_transform || []), ...(audio_spec.transform || [])], forced_dimensions);
  } else {
    data = transformData(_data, audio_spec.transform || [], forced_dimensions);
  }
  let dataInfo = deepcopy(data.tableInfo);

  // encoding properties
  let encoding = layer_spec.encoding;
  let tone_spec = layer_spec.tone;
  if (tone_spec.type === "default") {
    tone_spec = {
      type: 'default',
      continued: tone_spec.continued
    }
  }
  let channels = Object.keys(encoding).filter((c) => ![TIME_chn, TIME2_chn, TIMBRE_chn].includes(c));
  let hasTime2 = (encoding[TIME_chn] && encoding[TIME2_chn]);
  let is_repeated = encoding[REPEAT_chn] !== undefined;
  let has_repeat_speech = is_repeated && encoding[REPEAT_chn].speech;
  if (has_repeat_speech === undefined) has_repeat_speech = true;
  let repeat_field = is_repeated ? encoding[REPEAT_chn].field : undefined;
  if (repeat_field && jType(repeat_field) !== 'Array') repeat_field = [repeat_field];
  let repeat_direction = encoding[REPEAT_chn]?.by;
  if (is_repeated) {
    if (repeat_direction === undefined) repeat_direction = SEQUENCE;
    if (jType(repeat_direction) !== 'Array') repeat_direction = [repeat_direction];
    if (repeat_field.length !== repeat_direction.length) {
      if (repeat_direction.length == 1) {
        repeat_direction = repeat_field.map(() => repeat_direction[0]);
      } else {
        console.error("The repeat direction is not matched with the repeat field(s)")
      }
    }
  }

  // data sort
  let data_order = [];
  if (TIME_chn in encoding && encoding[TIME_chn].scale?.order) {
    data_order.push({
      key: encoding[TIME_chn].field, order: [encoding[TIME_chn].scale?.order]
    });
  } else if (TIME_chn in encoding && encoding[TIME_chn].scale?.sort) {
    data_order.push({
      key: encoding[TIME_chn].field, sort: encoding[TIME_chn].scale?.sort
    });
  } else if (TIME_chn in encoding) {
    data_order.push({
      key: encoding[TIME_chn].field, order: unique(data.map(d => d[encoding[TIME_chn].field])).toSorted(asc)
    });
  }

  if (is_repeated && encoding[REPEAT_chn].scale?.order) {
    data_order.push({
      key: repeat_field, order: encoding[REPEAT_chn].scale?.order
    });
  } else if (is_repeated && encoding[REPEAT_chn].scale?.sort) {
    data_order.push({
      key: repeat_field, sort: encoding[REPEAT_chn].scale?.sort
    });
  } else if (is_repeated) {
    repeat_field.toReversed().forEach((key) => {
      let order = unique(data.map(d => d[key])).toSorted(asc);
      data_order.push({
        key, order
      });
    });
  }

  data = orderArray(data, data_order);

  delete data.tableInfo;

  // treat repeat
  let audio_graph = [], repeated_graph = [], repeated_graph_map = {}, repeat_values, repeat_level = 0;

  if (is_repeated) {
    repeat_level = repeat_field.length;
    repeat_values = unique(data.map((d) => repeat_field.map((k) => d[k]).join("_$_"))).map((d) => d.split("_$_"));
    repeat_values.forEach((d) => {
      let g = [];
      g.name = listString(d, ", ", true);
      g.membership = [];
      repeat_field.forEach((f, i) => {
        g.membership.push({ key: f, value: d[i] });
      });
      d.membership = g.membership;
      repeated_graph.push(g);
      repeated_graph_map[d.join("&")] = repeated_graph.length - 1
    });
  }

  // get scales
  let scales = {};
  for (const channel in encoding) {
    let enc = encoding[channel];
    scales[channel] = common_scales[enc.scale.id];
  }

  // relativity
  let relative_stream = encoding[TIME_chn].scale.timing === REL_TIMING || scales.time?.properties?.timing === REL_TIMING;

  // ramping
  let ramp = {};
  for (const channel in encoding) {
    ramp[channel] = encoding[channel].ramp;
  }

  // tick
  let hasTick = encoding[TIME_chn].tick !== undefined, tick;
  if (hasTick) {
    let tickItem = encoding[TIME_chn].tick;
    if (tickItem.name && tickDef[tickItem.name]) {
      tick = tickDef[tickItem.name];
    } else {
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
    let __config = deepcopy(config);
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
  for (const i in data) {
    if (i === 'tableInfo') continue;
    let datum = data[i];
    // if (datum[encoding[TIME_chn].field] !== undefined) continue;
    let repeat_index = is_repeated && repeated_graph_map[repeat_field.map(k => datum[k]).join("&")]
    let glyph = scales.time(
      (datum[encoding[TIME_chn].field] !== undefined ? datum[encoding[TIME_chn].field] : parseInt(i)),
      (hasTime2 ?
        (datum[encoding[TIME2_chn].field] !== undefined ? datum[encoding[TIME2_chn].field] : (parseInt(i) + 1))
        : undefined)
    );
    if (tone_spec.continued && !hasTime2) {
      delete glyph.end;
      glyph.duration = 0;
    }
    if (glyph.start === undefined) continue;
    glyph.timbre = scales.timbre ? scales.timbre(datum[encoding[TIMBRE_chn].field]) : tone_spec.type;
    let speechBefore, speechAfter;
    for (const channel of channels) {
      if (scales[channel]) {
        glyph[channel] = scales[channel](datum[encoding[channel].field]);
      }
      // adjust for tapcount
      if (TapChannels.includes(channel)) {
        glyph.duration = glyph[channel].totalLength;
      }
    }
    if (glyph[SPEECH_BEFORE_chn]) {
      speechBefore = {
        speech: glyph[SPEECH_BEFORE_chn],
        start: glyph.start,
        end: glyph.end,
        language: encoding[SPEECH_BEFORE_chn]?.language ? encoding[SPEECH_BEFORE_chn]?.language : document?.documentElement?.lang
      };
    }
    if (glyph[SPEECH_AFTER_chn]) {
      speechAfter = {
        speech: glyph[SPEECH_AFTER_chn],
        start: glyph.start,
        end: glyph.end,
        language: encoding[SPEECH_BEFORE_chn]?.language ? encoding[SPEECH_BEFORE_chn]?.language : document?.documentElement?.lang
      };
    }
    if (speechBefore) {
      if (is_repeated) repeated_graph[repeat_index].push(speechBefore);
      else audio_graph.push(speechBefore);
    }
    glyph.__datum = datum;
    if (is_repeated) repeated_graph[repeat_index].push(glyph);
    else audio_graph.push(glyph);
    if (speechAfter) {
      if (is_repeated) repeated_graph[repeat_index].push(speechAfter);
      else audio_graph.push(speechAfter);
    }
  }
  let is_continued = tone_spec.continued === undefined ? false : tone_spec.continued;
  let instrument_type = tone_spec.type || 'default'

  // repetition control
  let stream;
  if (is_repeated) {
    let repeat_streams = makeRepeatStreamTree(0, repeat_values, repeat_direction);
    repeated_graph.forEach((g, i) => {
      let r_stream = new UnitStream(instrument_type, g, scales, { is_continued, relative: relative_stream });
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

      let rs_accessor = repeat_streams;
      for (let i = 0; i < repeat_level; i++) {
        rs_accessor = rs_accessor.nodes;
        let member = g.membership[i];
        for (let j = 0; j < rs_accessor.length; j++) {
          if (rs_accessor[j].parent_value == member.value) {
            rs_accessor = rs_accessor[j];
            break;
          }
        }
      }
      rs_accessor.node.push(r_stream);
    });
    // post_processing
    let processed_repeat_stremas = postprocessRepeatStreams(repeat_streams);

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
      if (jType(s) === OverlayStream.name) {
        Object.assign(s.config, s.overlays[0].config);
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
    stream = new UnitStream(instrument_type, audio_graph, scales, { is_continued, relative: relative_stream });
    Object.keys(config || {}).forEach(key => {
      stream.setConfig(key, config?.[key]);
    });
    if (hasTick) {
      stream.setConfig("tick", tick);
    }
    if (layer_spec.name) stream.setName(layer_spec.name);
    if (audioFilters) stream.setFilters(audioFilters);
    stream.setRamp(ramp);
    if (audio_spec.description) stream.setDescription(audio_spec.description);
  }
  return { stream, scales };
}