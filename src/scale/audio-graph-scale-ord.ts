import { ascending, descending, scaleOrdinal } from "d3";
import { PITCH_chn, TIMBRE_chn, NEG, RecordObject, NormalizedEncodingItem, ParsedScaleDefinition, ParsedScaleFunction, ParsedScaleProperties, POS } from "../types";
import { getFirstDefined, unique, deepcopy, noteToFreq } from "../util";
import { NomPalletes, repeatPallete, QuantPreferredRange } from "./audio-graph-palletes";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";
import { getChannelCaps, getChannelThresholds } from "./audio-graph-scale-thresholds";

export function makeOrdinalScaleFunction(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[],
  info: RecordObject,
): ParsedScaleFunction {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let extraChannelType = FilterExtraChannelTypes[channel as keyof typeof FilterExtraChannelTypes]?.type;


  // thresholds
  const [CHN_MAX, CHN_MIN] = getChannelThresholds(channel, extraChannelType);
  const [CHN_CAP_MAX, CHN_CAP_MIN] = getChannelCaps(channel, extraChannelType);

  let scaleDef = encoding?.scale;
  let scaleProperties: ParsedScaleProperties = {
    channel,
    encodingType: encoding.type,
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

  // range (fielded range is already treated)
  let range = deepcopy(scaleDef?.range || null) as any[];
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    rangeProvided = true;
    scaleProperties.times = times;
  }// to skip the below changes when `times` is present while range is not.
  let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
  // for timbre (not recommnded), skips the below transformations
  if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
    range = repeatPallete(NomPalletes[TIMBRE_chn as keyof typeof NomPalletes] as any[], domain.length);
    rangeProvided = true;
  }
  let scaleOutRange!: [number, number];
  if (!rangeProvided && maxDistinct) {
    scaleOutRange = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
  } else if (!rangeProvided && !maxDistinct) {
    let p = QuantPreferredRange[channel as keyof typeof QuantPreferredRange];
    if (p) scaleOutRange = [getFirstDefined(rangeMin, p[0], CHN_MIN), getFirstDefined(rangeMax, p[1], CHN_MAX)];
  }
  // match the count
  if (scaleOutRange && !rangeProvided) {
    range = divideOrdScale(scaleOutRange, domain.length);
  }
  // note for pitch  -> freq 
  if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every((d: any) => typeof d === "number")) {
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
  //@ts-ignore
  let scaleFunction: ParsedScaleFunction = scaleOrdinal().domain(domain).range(range);
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}

function divideOrdScale(biRange: [number, number], len: number): any[] {
  if (len < 1) return [];
  else if (len == 1) return [(biRange[0] + biRange[1]) / 2]
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