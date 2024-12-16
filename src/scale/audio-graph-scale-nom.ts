import { scaleOrdinal } from "d3";
import { ChannelCaps, NormalizedEncodingItem, ParsedScaleDefinition, ParsedScaleFunction, ParsedScaleProperties, PITCH_chn, RecordObject, REPEAT_chn, TIMBRE_chn } from "../types";
import { NomPalletes, repeatPallete } from "./audio-graph-palletes";
import { unique, deepcopy, jType, noteToFreq } from "../util";

import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";

export function makeNominalScaleFunction(
  channel: string,
  encoding: NormalizedEncodingItem & ParsedScaleDefinition,
  values: any[],
  info: RecordObject,
): ParsedScaleFunction {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let extraChannelType = FilterExtraChannelTypes[channel as keyof typeof FilterExtraChannelTypes]?.type;
  const CHN_CAP_MAX
    = ChannelCaps[channel as keyof typeof ChannelCaps]?.max
    || ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.max,
    CHN_CAP_MIN
      = ChannelCaps[channel as keyof typeof ChannelCaps]?.min
      || ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.min;
  let scaleDef = encoding?.scale;
  let scaleProperties: ParsedScaleProperties = {
    channel,
    encodingType: encoding.type
  }

  // domain
  let domain = deepcopy(scaleDef?.domain || null);
  if (!domain) {
    domain = unique(values);
  }
  scaleProperties.domain = domain;

  // range (fielded range is already treated)
  let range = deepcopy(scaleDef?.range || null) as any[];
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    scaleProperties.times = times;
  }
  if (!rangeProvided && channel !== REPEAT_chn) {
    let init_pallet = NomPalletes[channel as keyof typeof NomPalletes] || NomPalletes[extraChannelType as keyof typeof NomPalletes]
    if (!init_pallet) console.error("No initial pallete provided")
    else range = repeatPallete(init_pallet, domain.length);
  } else if (channel === REPEAT_chn) {
    range = domain.map((d, i) => i);
  } else {
    scaleProperties.rangeProvided = rangeProvided;
  }
  // note for pitch  -> freq 
  if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every((d: any) => typeof d === "number")) {
    range = range?.map(noteToFreq);
  }
  range = range?.map((d: any) => {
    if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
      return d;
    } else {
      if (d < CHN_CAP_MIN) {
        console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
        return CHN_CAP_MIN;
      } else if (d > CHN_CAP_MAX) {
        console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
        return CHN_CAP_MAX;
      } else {
        return d;
      }
    }
  });

  scaleProperties.range = range;
  // make the scale function
  // @ts-ignore
  let scaleFunction: ParsedScaleFunction = scaleOrdinal().domain(domain).range(range);
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}