import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { local, timeParse } from "d3";
import { QuantPreferredRange } from "./audio-graph-palletes";
import {
  getChannelCaps,
  getChannelThresholds
} from "./audio-graph-scale-thresholds";
import { scaleTime } from "d3";
import {
  noteToFreq,
  deepcopy,
  getFirstDefined
} from "../util";
import {
  PITCH_chn,
  PAN_chn,
  TIMBRE_chn,
  NEG,
  POS,
  ParsedScaleDefinition,
  ParsedScaleProperties,
  ParsedScaleFunction,
  timeUnitDomainDefs,
  RecordObject,
  getPresetTimeUnitValues,
  bcp47language
} from "../types";
import { FilterExtraChannelTypes } from "../player";


export function makeTemporalScaleFunction(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[] | undefined,
  info: RecordObject,
  is_streamed?: boolean
): ParsedScaleFunction {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let extraChannelType = FilterExtraChannelTypes[channel as keyof typeof FilterExtraChannelTypes]?.type;
  let locale: typeof bcp47language[number] | undefined = info.locale;

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
    console.error("Timber channel can't be scaled for a temporal encoding.")
  }

  // has Time unit
  let newScaleDef = deepcopy(encoding);
  // [todo: check stability]
  if (scaleDef?.domain) {
    newScaleDef.scale.domain = timeUnitDomain(scaleDef?.domain, encoding?.timeUnit ?? "date", encoding?.timeUnitName, locale);
  }
  if (encoding?.timeUnit) {
    let ordScale = makeOrdinalScaleFunction(channel, newScaleDef, values, info);
    let timeUnitFunction = makeTimeUnitFunction(encoding?.timeUnit, encoding?.timeUnitName, locale);
    Object.assign(scaleProperties, ordScale.properties);
    scaleProperties.timeUnit = encoding?.timeUnit;
    scaleProperties.timeUnitName = deepcopy(encoding?.timeUnitName);
    // @ts-ignore
    let scaleFunction: ParsedScaleFunction = (d: any) => {
      return ordScale(timeUnitFunction(d));
    }
    scaleFunction.properties = scaleProperties;
    return scaleFunction
  }

  // time level 
  let timeLevelFunction = makeTimeLevelFunction(encoding?.timeLevel);
  scaleProperties.timeLevel = encoding?.timeLevel;

  // domain
  let domain, domainSpecified: boolean | boolean[];
  if (scaleDef?.domain) {
    domain = deepcopy(scaleDef?.domain).map((d) => {
      return timeLevelFunction(d);
    });
  }
  if (encoding?.scale?.domainMin !== undefined || encoding?.scale?.domainMax !== undefined || encoding?.scale?.domainMid !== undefined) {
    domain = [
      timeLevelFunction(encoding?.scale?.domainMin !== undefined ? encoding?.scale?.domainMin : domainMin),
      timeLevelFunction(encoding?.scale?.domainMax !== undefined ? encoding?.scale?.domainMax : domainMax)
    ];
    if ((channel === PAN_chn || extraChannelType === PAN_chn) && scaleDef?.domainMid !== undefined) {
      domain.splice(1, 0, timeLevelFunction(scaleDef?.domainMid));
      domainSpecified = [encoding?.scale?.domainMin !== undefined, encoding?.scale?.domainMid !== undefined, encoding?.scale?.domainMax !== undefined]
    } else {
      domainSpecified = [encoding?.scale?.domainMin !== undefined, encoding?.scale?.domainMax !== undefined]
    }
  } else if (!domain) {
    domain = [timeLevelFunction(domainMin), timeLevelFunction(domainMax)];
    domainSpecified = false
  } else {
    domainSpecified = true;
  }

  scaleProperties.domain = encoding?.scale.domain;
  scaleProperties.domainSpecified = domainSpecified;

  // range
  let range = deepcopy(scaleDef?.range || null) as any[];
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map((d: any) => d * times);
    rangeProvided = true;
  }// to skip the below changes when `times` is present while range is not.

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
  if ((channel === PITCH_chn || extraChannelType === PITCH_chn) && !range.every(d => typeof d === 'number')) {
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

  // polarity (only works when a range is not provided)
  if (!rangeProvided) {
    if (domain[0] < domain[1] && polarity === NEG) {
      range = range.reverse();
    } else if (domain[0] > domain[1] && polarity === POS) {
      range = range.reverse();
    }
  }

  // type guard (already cleared)
  if (encoding?.scale?.range instanceof Array) {
    scaleProperties.range = encoding?.scale?.range;
  }

  // make function;
  let scaleFunction = scaleTime().domain(domain).range(range);
  //@ts-ignore
  let finalScaleFunction: ParsedScaleFunction = (d) => {
    return scaleFunction(timeLevelFunction(d))
  };
  finalScaleFunction.properties = scaleProperties;
  return finalScaleFunction;
}

export function makeTimeLevelFunction(timeLevel?: string) {
  if (!timeLevel) return (d: any) => { return new Date(d) };
  else {
    if (timeLevel === 'year') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), 0, 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'month') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'date') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 0, 0, 0, 0);
      }
    } else if (timeLevel === 'hour') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), 0, 0, 0);
      }
    } else if (timeLevel === 'minute') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes(), 0, 0);
      }
    } else if (timeLevel === 'second') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), 0);
      }
    } else if (timeLevel === 'millisecond') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCSeconds());
      }
    } else {
      return (d: any) => { return new Date(d) };
    }
  }
}

export function makeTimeUnitFunction(
  timeUnit: string,
  _names: string | string[] | number[] | undefined,
  locale?: typeof bcp47language[number]
) {
  let names!: string | string[] | number[];
  if (!timeUnit) return (d: any) => { return new Date(d) };
  else {
    if (timeUnit === 'year') {
      return (d: any) => {
        return new Date(d).getUTCFullYear();
      }
    } else if (timeUnit === 'month') {
      names = getPresetTimeUnitValues("month", _names, locale);
      return (d: any) => {
        return names[new Date(d).getUTCMonth()];
      }
    } else if (timeUnit === 'day') {
      names = getPresetTimeUnitValues("day", _names, locale);
      return (d: any) => {
        return names[new Date(d).getUTCDay()];
      }
    } else if (timeUnit === 'date') {
      return (d: any) => {
        return new Date(d).getUTCDate();
      }
    } else if (timeUnit === 'hour') {
      return (d: any) => {
        return new Date(d).getUTCHours();
      }
    } else if (timeUnit === 'hour12') {
      return (d: any) => {
        return new Date(d).getUTCHours() % 12 || 12;
      }
    } else if (timeUnit === 'minute') {
      return (d: any) => {
        return new Date(d).getUTCMinutes();
      }
    } else if (timeUnit === 'second') {
      return (d: any) => {
        return new Date(d).getUTCSeconds();
      }
    } else if (timeUnit === 'millisecond') {
      return (d: any) => {
        return new Date(d).getUTCMilliseconds();
      }
    } else {
      return (d: any) => { return new Date(d) };
    }
  }
}

// todo: make a timezone checker and use that

export function timeUnitDomain(
  orgDomain: any[],
  timeUnit: string,
  _names: string | string[] | number[] | undefined,
  locale?: typeof bcp47language[number]
): string[] | number[] | undefined {
  let names!: string | string[] | number[];
  if (timeUnit === 'year') {
    return [new Date(orgDomain[0]).getUTCFullYear(), new Date(orgDomain[1]).getUTCFullYear()]
  } else if (timeUnit === 'month') {
    names = getPresetTimeUnitValues("month", _names, locale);
    return names;
  } else if (timeUnit === 'day') {
    names = getPresetTimeUnitValues("day", _names, locale);
    return names;
  } else if (timeUnit === 'date') {
    return timeUnitDomainDefs.date;
  } else if (timeUnit === 'hour') {
    return timeUnitDomainDefs.hour;
  } else if (timeUnit === 'hour12') {
    return timeUnitDomainDefs.hour12;
  } else if (timeUnit === 'minute') {
    return timeUnitDomainDefs.minute;
  } else if (timeUnit === 'second') {
    return timeUnitDomainDefs.second;
  } else if (timeUnit === 'millisecond') {
    return timeUnitDomainDefs.millisecond;
  }
}