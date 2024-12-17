import { scaleTime } from "d3";
import { jType, noteToFreq, aRange, deepcopy, getFirstDefined } from "../util";
import { PITCH_chn, NEG, POS, PAN_chn, TIMBRE_chn, NormalizedEncodingItem, ParsedScaleDefinition, RecordObject, ParsedScaleProperties, timeUnitDomainDefs, ParsedScaleFunction } from "../types";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { QuantPreferredRange } from "./audio-graph-palletes";

import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";
import { getChannelCaps, getChannelThresholds } from "./audio-graph-scale-thresholds";

export function makeTemporalScaleFunction(
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
    console.error("Timber channel can't be scaled for a temporal encoding.")
  }

  // has Time unit
  let newScaleDef = deepcopy(encoding);
  // [todo: check stability]
  if (scaleDef?.domain) {
    newScaleDef.scale.domain = timeUnitDomain(scaleDef?.domain, encoding?.timeUnit ?? "date", encoding?.timeUnitName);
  }
  if (encoding?.timeUnit) {
    let ordScale = makeOrdinalScaleFunction(channel, newScaleDef, values, info);
    let timeUnitFunction = makeTimeUnitFunction(encoding?.timeUnit, encoding?.timeUnitName);
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
        return new Date(dt.getFullYear(), 0, 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'month') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'date') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
      }
    } else if (timeLevel === 'hour') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0, 0);
      }
    } else if (timeLevel === 'minute') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), 0, 0);
      }
    } else if (timeLevel === 'second') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), 0);
      }
    } else if (timeLevel === 'millisecond') {
      return (d: any) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
      }
    } else {
      return (d: any) => { return new Date(d) };
    }
  }
}
export function makeTimeUnitFunction(
  timeUnit: string,
  _names: string | string[] | number[] | undefined
) {
  let names!: string | string[] | number[];
  if (!timeUnit) return (d: any) => { return new Date(d) };
  else {
    if (timeUnit === 'year') {
      return (d: any) => {
        return new Date(d).getFullYear();
      }
    } else if (timeUnit === 'month') {
      names = _names || 'number';
      if (names == "number") names = timeUnitDomainDefs.monthNumber;
      else if (names == "number1") names = timeUnitDomainDefs.monthNumber1
      else if (names == "short") names = timeUnitDomainDefs.monthShort;
      else if (names == "long") names = timeUnitDomainDefs.monthLong;
      else if (typeof names === 'string') names = timeUnitDomainDefs.monthLong;
      return (d: any) => {
        return names[new Date(d).getMonth()];
      }
    } else if (timeUnit === 'day') {
      names = _names || timeUnitDomainDefs.dayLong
      if (names == "number") names = timeUnitDomainDefs.dayNumber
      else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
      else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
      else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
      else if (names == "short") names = timeUnitDomainDefs.dayShort;
      else if (typeof names === 'string') names = timeUnitDomainDefs.dayLong;
      return (d: any) => {
        return names[new Date(d).getDay()];
      }
    } else if (timeUnit === 'date') {
      return (d: any) => {
        return new Date(d).getDate();
      }
    } else if (timeUnit === 'hour') {
      return (d: any) => {
        return new Date(d).getHours();
      }
    } else if (timeUnit === 'hour12') {
      return (d: any) => {
        return new Date(d).getHours() % 12;
      }
    } else if (timeUnit === 'minute') {
      return (d: any) => {
        return new Date(d).getMinutes();
      }
    } else if (timeUnit === 'second') {
      return (d: any) => {
        return new Date(d).getSeconds();
      }
    } else if (timeUnit === 'millisecond') {
      return (d: any) => {
        return new Date(d).getMilliseconds();
      }
    } else {
      return (d: any) => { return new Date(d) };
    }
  }
}

export function timeUnitDomain(
  orgDomain: any[],
  timeUnit: string,
  _names: string | string[] | number[] | undefined
): string[] | number[] | undefined {
  let names!: string | string[] | number[];
  if (timeUnit === 'year') {
    return [new Date(orgDomain[0]).getDay(), new Date(orgDomain[1]).getDay()]
  } else if (timeUnit === 'month') {
    names = _names || 'number';
    if (names == "number") names = timeUnitDomainDefs.monthNumber;
    else if (names == "number1") names = timeUnitDomainDefs.monthNumber1
    else if (names == "short") names = timeUnitDomainDefs.monthShort;
    else if (names == "long") names = timeUnitDomainDefs.monthLong;
    else if (typeof names === 'string') names = timeUnitDomainDefs.monthLong;
    return names;
  } else if (timeUnit === 'day') {
    names = _names || timeUnitDomainDefs.dayLong
    if (names == "number") names = timeUnitDomainDefs.dayNumber
    else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
    else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
    else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
    else if (names == "short") names = timeUnitDomainDefs.dayShort;
    else if (typeof names === 'string') names = timeUnitDomainDefs.dayLong;
    return names;
  } else if (timeUnit === 'date') {
    return timeUnitDomainDefs.date;
  } else if (timeUnit === 'hour') {
    return timeUnitDomainDefs.hour;
  } else if (timeUnit === 'hour12') {
    return timeUnitDomainDefs.hour;
  } else if (timeUnit === 'minute') {
    return timeUnitDomainDefs.minute;
  } else if (timeUnit === 'second') {
    return timeUnitDomainDefs.second;
  } else if (timeUnit === 'millisecond') {
    return timeUnitDomainDefs.millisecond;
  }
}