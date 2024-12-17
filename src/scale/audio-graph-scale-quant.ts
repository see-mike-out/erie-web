import { scaleLinear, scaleSymlog, scaleLog, scaleSqrt, scalePow } from "d3";
import { noteToFreq, jType, deepcopy, getFirstDefined } from "../util";
import { QuantPreferredRange } from "./audio-graph-palletes";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";
import {
  LOG, SYMLOG, SQRT, POW, PITCH_chn, NEG, POS, PAN_chn, TIMBRE_chn,
  NormalizedEncodingItem, ParsedScaleDefinition, ParsedScaleFunction, RecordObject,
  ParsedScaleProperties
} from "../types";
import { getChannelCaps, getChannelThresholds } from "./audio-graph-scale-thresholds";

export function makeQuantitativeScaleFunction(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[],
  info: RecordObject
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
  if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
    console.error("Timber channel can't be quantitatively scaled.")
  }

  // domain
  let domain = deepcopy(scaleDef?.domain || null), domainSpecified: boolean | boolean[] = false;
  if (encoding?.scale?.domainMin !== undefined || encoding?.scale?.domainMax !== undefined || encoding?.scale?.domainMid !== undefined) {
    domain = [
      encoding?.scale?.domainMin !== undefined ? encoding?.scale?.domainMin : domainMin,
      encoding?.scale?.domainMax !== undefined ? encoding?.scale?.domainMax : domainMax
    ];
    if (channel === PAN_chn && scaleDef?.domainMid !== undefined) {
      domain.splice(1, 0, scaleDef?.domainMid);
      domainSpecified = [encoding?.scale?.domainMin !== undefined, encoding?.scale?.domainMid !== undefined, encoding?.scale?.domainMax !== undefined]
    } else {
      domainSpecified = [encoding?.scale?.domainMin !== undefined, encoding?.scale?.domainMax !== undefined]
    }
  } else if (!domain) {
    domain = [domainMin, domainMax];
    if (zero) domain = [0, domainMax];
    domainSpecified = false;
  } else {
    domainSpecified = true;
  }
  scaleProperties.domain = domain;
  scaleProperties.domainSpecified = domainSpecified;

  // range
  let range = deepcopy(scaleDef?.range || null) as any[];
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    rangeProvided = true;
  } // to skip the below changes when `times` is present while range is not.

  let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
  if (!rangeProvided && maxDistinct) {
    range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
  } else if (!rangeProvided && !maxDistinct) {
    let p = QuantPreferredRange[channel as keyof typeof QuantPreferredRange] || QuantPreferredRange[extraChannelType as keyof typeof QuantPreferredRange];
    if (p) range = [getFirstDefined(rangeMin, p[0], CHN_MIN), getFirstDefined(rangeMax, p[1], CHN_MAX)];
  }
  if ((channel === PAN_chn || extraChannelType === PAN_chn) && !rangeProvided && domain.length == 3) {
    range.splice(1, 0, 0);
  }
  if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => jType(d) === "Number")) {
    range = range.map(noteToFreq);
  }
  range = range.map((d) => {
    if (d < CHN_CAP_MIN) {
      console.warn(`The range value of ${d} is less than the possible ${channel} value ${CHN_CAP_MIN}. The scale is capped to the minimum possible value.`);
      return CHN_CAP_MIN;
    } else if (d > CHN_CAP_MAX) {
      console.warn(`The range value of ${d} is greater than the possible ${channel} value ${CHN_CAP_MAX}. The scale is capped to the maximum possible value.`);
      return CHN_CAP_MAX;
    } else {
      return d;
    }
  });

  // polarity
  if (domain[0] < domain[1] && polarity === NEG) {
    range = range.reverse();
  } else if (domain[0] > domain[1] && polarity === POS) {
    range = range.reverse();
  }

  scaleProperties.range = range;

  // domain fix when the range is more divided than the domain (linear mapping)
  if (!encoding?.scale?.domain && domain.length == 2 && rangeProvided && domain.length < range.length) {
    console.warn(`The domain is not provided while the range is provided. Erie fixed domain to match with the range. This fix is linear, so if you are using other scale types, make sure to provide the specific domain cuts.`);
    domain = range.map((d, i) => {
      if (i == 0) return domainMin;
      else if (i == range.length - 1) return domainMax;
      else {
        return domainMin + (domainMax - domainMin) * (i / (range.length - 1));
      }
    });
  }

  // transform
  let scaleFunction!: ParsedScaleFunction;
  let scaleTransformType = scaleDef?.type;
  if (scaleTransformType === LOG) {
    if (scaleDef?.base == 0) {
      console.warn(`The log base can't be 0. It is converted to 10.`);
    }
    let base = scaleDef?.base || 10;
    // @ts-ignore
    scaleFunction = scaleLog().base(base);
  } else if (scaleTransformType === SYMLOG) {
    let constant = scaleDef?.constant || 1;
    // @ts-ignore
    scaleFunction = scaleSymlog().constant(constant);
  } else if (scaleTransformType === SQRT) {
    // @ts-ignore
    scaleFunction = scaleSqrt();
  } else if (scaleTransformType === POW) {
    let exp = scaleDef?.exponent !== undefined ? scaleDef.exponent : 2;
    // @ts-ignore
    scaleFunction = scalePow().exponent(exp);
  } else {
    // @ts-ignore
    scaleFunction = scaleLinear();
  }
  scaleProperties.scaleType = scaleTransformType || "linear";

  // enter domain & range (d3-related)
  // @ts-ignore
  scaleFunction = scaleFunction.domain(domain);
  // @ts-ignore
  if (nice) scaleFunction = scaleFunction.nice();
  // @ts-ignore
  scaleFunction = scaleFunction.range(range);
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}
