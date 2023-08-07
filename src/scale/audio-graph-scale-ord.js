import { ascending, descending, scaleOrdinal } from "d3";
import { firstDefined, unique, deepcopy } from "../util/audio-graph-util";
import { ChannelCaps, ChannelThresholds, PITCH_chn, TIMBRE_chn, NEG } from "./audio-graph-scale-constant";
import { NomPalletes, repeatPallete } from "./audio-graph-palletes";
import { jType } from "../util/audio-graph-typing-util";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";

export function makeOrdinalScaleFunction(channel, encoding, values, info) {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let extraChannelType = FilterExtraChannelTypes[channel]?.type;
  const CHN_MAX = ChannelThresholds[channel]?.max || ChannelThresholds[extraChannelType]?.max,
    CHN_MIN = ChannelThresholds[channel]?.min || ChannelThresholds[extraChannelType]?.min;
  const CHN_CAP_MAX = ChannelCaps[channel]?.max || ChannelCaps[extraChannelType]?.max,
    CHN_CAP_MIN = ChannelCaps[channel]?.min || ChannelCaps[extraChannelType]?.min;
  let scaleDef = encoding?.scale;
  let scaleProperties = {
    channel,
    polarity,
  }

  let sort = encoding.sort;
  let sortFunction;
  if (sort === "descending" || sort === "desc") {
    sortFunction = descending;
    scaleProperties.sort = "descending";
  } else {
    sortFunction = ascending;
    scaleProperties.sort = "ascending";
  }
  // domain
  let domain = deepcopy(scaleDef?.domain || null);
  if (!domain) {
    domain = unique(values).toSorted(sortFunction);
  }
  scaleProperties.domain = domain;

  // range
  let range = deepcopy(scaleDef?.range || null);
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    rangeProvided = true;
    scaleProperties.times = times;
  }// to skip the below changes when `times` is present while range is not.
  let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
  // for timbre (not recommnded), skips the below transformations
  if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
    range = repeatPallete(NomPalletes[TIMBRE_chn], domain.length);
    rangeProvided = true;
  }
  let scaleOutRange;
  if (!rangeProvided && maxDistinct) {
    scaleOutRange = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
  } else if (!rangeProvided && !maxDistinct) {
    let p = QuantPreferredRange[channel];
    scaleOutRange = [firstDefined(rangeMin, p[0], CHN_MIN), firstDefined(rangeMax, p[1], CHN_MAX)];
  }
  // match the count
  if (scaleOutRange && !rangeProvided) {
    range = divideOrdScale(scaleOutRange, domain.length);
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

  // polarity (only works when a range is not provided)
  if (!rangeProvided) {
    if (domain[0] < domain[1] && polarity === NEG) {
      range = range.reverse();
    } else if (domain[0] > domain[1] && polarity === POS) {
      range = range.reverse();
    }
  }
  scaleProperties.range = range;

  // make the scale function
  let scaleFunction = scaleOrdinal().domain(domain).range(range);
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}

function divideOrdScale(biRange, len) {
  if (len < 1) return [];
  else if (len == 1) return (biRange[0] + biRange[1]) / 2
  let rLen = len;
  let max = biRange[1];
  let min = biRange[0];
  if (min != 0) rLen = len - 1;
  let gap = (max - min) / rLen;
  let o = [];
  for (let j = min; j <= max; j += gap) {
    o.push(j);
  }
  return o.slice(len == rLen ? 1 : 0, rLen + 1);
}