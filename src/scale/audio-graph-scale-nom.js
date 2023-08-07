import { scaleOrdinal } from "d3";
import { unique, deepcopy } from "../util/audio-graph-util";
import { ChannelCaps, PITCH_chn, REPEAT_chn, TIMBRE_chn } from "./audio-graph-scale-constant";
import { NomPalletes, repeatPallete } from "./audio-graph-palletes";
import { jType } from "../util/audio-graph-typing-util";
import { noteToFreq } from "../util/audio-graph-scale-util";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";

export function makeNominalScaleFunction(channel, encoding, values, info) {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let extraChannelType = FilterExtraChannelTypes[channel]?.type;
  const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
    CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
  let scaleDef = encoding?.scale;
  let scaleProperties = {
    channel,
  }

  // domain
  let domain = deepcopy(scaleDef?.domain || null);
  if (!domain) {
    domain = unique(values);
  }

  scaleProperties.domain = domain;
  // range
  let range = deepcopy(scaleDef?.range || null);
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    scale.properties.times = times;
  }
  if (!rangeProvided && channel !== REPEAT_chn) {
    range = repeatPallete(NomPalletes[channel] || NomPalletes[extraChannelType], domain.length);
  } else if (channel === REPEAT_chn) {
    range = domain.map((d, i) => i);
  } else {
    scaleProperties.rangeProvided = rangeProvided;
  }
  // note for pitch  -> freq 
  if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
    range = range.map(noteToFreq);
  }
  range = range.map((d, i) => {
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
  let scaleFunction = scaleOrdinal().domain(domain).range(range);
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}