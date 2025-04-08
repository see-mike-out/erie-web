import { Datum, EncodingItemNormed, EncodingNormed, Glyph, HashedObject, PAN_AZIMUTH_chn, PAN_POLAR_chn, PAN_RADIUS_chn, PAN_X_chn, PAN_Y_chn, PAN_Z_chn, RepeatGraphItem, ScaleCollection, SPEECH_AFTER_chn, SPEECH_BEFORE_chn, TapChannels, TIMBRE_chn, TIME2_chn, TIME_chn, ToneNormed } from "../types";
import { cosDeg, sinDeg } from "../util";

export function makeGlyph(
  i: `${number}`,
  datum: Datum,
  tone_spec: ToneNormed,
  channels: string[],
  encoding: EncodingNormed,
  scales: ScaleCollection,
  hasTime2: EncodingItemNormed,
  total_duration: number,
  repeat_options?: {
    is_repeated: boolean,
    repeat_field?: string[],
    repeated_graph_map: HashedObject<number>,
    repeated_graph: RepeatGraphItem[],
    repeat_total_duration: number[],
  }
): {
  glyphs: Glyph[],
  total_duration: number,
  repeated_graph: RepeatGraphItem[],
  repeat_total_duration: number[]
} {
  let glyphs: Glyph[] = []

  let is_repeated = repeat_options?.is_repeated,
    repeat_field = repeat_options?.repeat_field,
    repeated_graph_map = repeat_options?.repeated_graph_map ?? {},
    repeated_graph = repeat_options?.repeated_graph ?? [],
    repeat_total_duration = repeat_options?.repeat_total_duration ?? [];

  let repeat_index = is_repeated && repeat_field ? repeated_graph_map[repeat_field.map(k => datum[k]).join("&")] : -1;
  let glyph = scales.time(
    (datum[encoding[TIME_chn].field as string] !== undefined ? datum[encoding[TIME_chn].field as string] : parseInt(i)),
    (hasTime2 ?
      (datum[encoding[TIME2_chn].field as string] !== undefined ? datum[encoding[TIME2_chn].field as string] : (parseInt(i) + 1))
      : undefined)
  );
  if (tone_spec.continued && !hasTime2) {
    delete glyph.end;
    glyph.duration = 0;
  }
  if (glyph.start === undefined) {
    return {
      glyphs,
      total_duration,
      repeated_graph,
      repeat_total_duration
    };
  }
  glyph.timbre = scales.timbre ? scales.timbre(datum[encoding[TIMBRE_chn].field as string]) : tone_spec.type;
  let speechBefore!: Glyph, speechAfter!: Glyph;
  for (const channel of channels) {
    if (scales[channel]) {
      glyph[channel] = scales[channel](datum[encoding[channel].field as string]);
    }
    // adjust for tapcount
    if (TapChannels.includes(channel)) {
      glyph.duration = glyph[channel].totalLength;
    }
  }
  // TODO - Post processing - convert polar to cartesian (if using polar), else keep cartesian/stereo

  if (glyph[PAN_RADIUS_chn] !== undefined && (glyph[PAN_POLAR_chn] !== undefined || glyph[PAN_AZIMUTH_chn] !== undefined)) {
    glyph[PAN_X_chn] = glyph[PAN_RADIUS_chn] * sinDeg(glyph[PAN_POLAR_chn] ?? 0) * cosDeg(glyph[PAN_AZIMUTH_chn] ?? 0);
    glyph[PAN_Y_chn] = glyph[PAN_RADIUS_chn] * sinDeg(glyph[PAN_POLAR_chn] ?? 0) * sinDeg(glyph[PAN_AZIMUTH_chn] ?? 0);
    glyph[PAN_Z_chn] = glyph[PAN_RADIUS_chn] * cosDeg(glyph[PAN_POLAR_chn] ?? 0);
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
    if (is_repeated && repeated_graph[repeat_index]) repeated_graph[repeat_index].glyphs.push(speechBefore);
    else glyphs.push(speechBefore);
  }
  glyph.__datum = datum;
  let endTime = 0;
  if (glyph.end) {
    endTime = glyph.end + (glyph.postReverb || 0)
  } else if (glyph.duration) {
    endTime = (glyph.start || 0) + glyph.duration + (glyph.postReverb || 0)
  }
  if (is_repeated && repeated_graph[repeat_index]) {
    repeated_graph[repeat_index].glyphs.push(glyph);
    repeat_total_duration[repeat_index] = Math.max(repeat_total_duration[repeat_index], endTime)
  } else {
    glyphs.push(glyph);
    total_duration = Math.max(total_duration, endTime)
  }
  if (speechAfter && repeated_graph[repeat_index]) {
    if (is_repeated) repeated_graph[repeat_index].glyphs.push(speechAfter);
    else glyphs.push(speechAfter);
  }

  return {
    glyphs,
    total_duration,
    repeated_graph,
    repeat_total_duration
  };
}