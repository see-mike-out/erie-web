import { noteToFreq } from "../util/audio-graph-scale-util";
import { jType } from "../util/audio-graph-typing-util";
import { deepcopy, firstDefined } from "../util/audio-graph-util";
import { QuantPreferredRange } from "./audio-graph-palletes";
import { ChannelThresholds, ChannelCaps, LOG, SYMLOG, SQRT, POW, PITCH_chn, NEG, POS, PAN_chn, TIMBRE_chn } from "./audio-graph-scale-constant";
import { scaleLinear, scaleSymlog, scaleLog, scaleSqrt, scalePow } from "d3";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";

export function makeQuantitativeScaleFunction(channel, encoding, values, info) {
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
  if (channel === TIMBRE_chn || extraChannelType === TIMBRE_chn) {
    console.error("Timber channel can't be quantitatively scaled.")
    return;
  }

  // domain
  let domain = deepcopy(scaleDef?.domain || null), domainSpecified = false;
  if (encoding?.domainMin !== undefined || encoding?.domainMax !== undefined || encoding?.domainMid !== undefined) {
    domain = [
      encoding?.domainMin !== undefined ? encoding?.domainMin : domainMin,
      encoding?.domainMax !== undefined ? encoding?.domainMax : domainMax
    ];
    if (channel === "pan" && scaleDef?.domainMid !== undefined) {
      domain.splice(1, 0, scaleDef?.domainMid);
      domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMid !== undefined, encoding?.domainMax !== undefined]
    } else {
      domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMax !== undefined]
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
  let range = deepcopy(scaleDef?.range || null);
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    rangeProvided = true;
  } // to skip the below changes when `times` is present while range is not.

  let rangeMin = scaleDef?.rangeMin, rangeMax = scaleDef?.rangeMax;
  if (!rangeProvided && maxDistinct) {
    range = [rangeMin !== undefined ? rangeMin : CHN_MIN, rangeMax !== undefined ? rangeMax : CHN_MAX];
  } else if (!rangeProvided && !maxDistinct) {
    let p = QuantPreferredRange[channel] || QuantPreferredRange[extraChannelType];
    range = [firstDefined(rangeMin, p[0], CHN_MIN), firstDefined(rangeMax, p[1], CHN_MAX)];
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
  let scaleFunction;
  let scaleTransformType = scaleDef?.type;
  if (scaleTransformType === LOG) {
    if (scaleDef?.base == 0) {
      console.warn(`The log base can't be 0. It is converted to 10.`);
    }
    let base = scaleDef?.base || 10;
    scaleFunction = scaleLog().base(base);
  } else if (scaleTransformType === SYMLOG) {
    let constant = scaleDef?.constant || 1;
    scaleFunction = scaleSymlog().constant(constant);
  } else if (scaleTransformType === SQRT) {
    scaleFunction = scaleSqrt();
  } else if (scaleTransformType === POW) {
    let exp = scaleDef?.exponent !== undefined ? scaleDef.exponent : 2;
    scaleFunction = scalePow().exponent(exp);
  } else {
    scaleFunction = scaleLinear();
  }
  scaleProperties.scaleType = scaleTransformType || "linear";

  // enter domain & range
  scaleFunction = scaleFunction.domain(domain);
  if (nice) scaleFunction = scaleFunction.nice();
  scaleFunction = scaleFunction.range(range);
  scaleFunction.properties = scaleProperties;
  window['scale_'+channel] = scaleFunction;
  return scaleFunction;
}
