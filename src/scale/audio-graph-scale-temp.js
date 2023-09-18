import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { noteToFreq } from "../util/audio-graph-scale-util";
import { jType } from "../util/audio-graph-typing-util";
import { aRange, deepcopy, firstDefined } from "../util/audio-graph-util";
import { QuantPreferredRange } from "./audio-graph-palletes";
import { ChannelThresholds, ChannelCaps, PITCH_chn, NEG, POS, PAN_chn, TIMBRE_chn } from "./audio-graph-scale-constant";
import { scaleTime } from "d3";
import { FilterExtraChannelTypes } from "../player/audio-graph-audio-filter";

export function makeTemporalScaleFunction(channel, encoding, _values, info) {
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
    console.error("Timber channel can't be scaled for a temporal encoding.")
    return;
  }

  // has Time unit
  if (encoding?.timeUnit) {
    let ordScale = makeOrdinalScaleFunction(channel, {
      domain: timeUnitDomain(scaleDef?.domain, encoding?.timeUnit, encoding?.dayName),
      range: scaleDef.range,
      polarity,
      maxDistinct,
      nice
    }, _values, info);
    let timeUnitFunction = makeTimeUnitFunction(encoding?.timeUnit, encoding?.dayName);
    Object.assign(scaleProperties, ordScale.properties);
    scaleProperties.timeUnit = encoding?.timeUnit;
    scaleProperties.dayName = deepcopy(encoding?.dayName);
    let scaleFunction = (d) => {
      return ordScale(timeUnitFunction(d));
    }
    scaleFunction.properties = scaleProperties;
    return scaleFunction
  }

  // time level 
  let timeLevelFunction = makeTimeLevelFunction(encoding?.timeLevel);
  scaleProperties.timeLevel = encoding?.timeLevel;

  // domain
  let domain, domainSpecified;
  if (scaleDef?.domain) {
    domain = deepcopy(scaleDef?.domain).map((d) => {
      return timeLevelFunction(d);
    });
  }
  if (encoding?.domainMin !== undefined || encoding?.domainMax !== undefined || encoding?.domainMid !== undefined) {
    domain = [
      timeLevelFunction(encoding?.domainMin !== undefined ? encoding?.domainMin : domainMin),
      timeLevelFunction(encoding?.domainMax !== undefined ? encoding?.domainMax : domainMax)
    ];
    if ((channel === PAN_chn || extraChannelType === PAN_chn) && scaleDef?.domainMid !== undefined) {
      domain.splice(1, 0, timeLevelFunction(scaleDef?.domainMid));
      domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMid !== undefined, encoding?.domainMax !== undefined]
    } else {
      domainSpecified = [encoding?.domainMin !== undefined, encoding?.domainMax !== undefined]
    }
  } else if (!domain) {
    domain = [timeLevelFunction(domainMin), timeLevelFunction(domainMax)];
    domainSpecified = false
  } else {
    domainSpecified = true;
  }

  scaleProperties.domain = encoding?.domain;
  scaleProperties.domainSpecified = domainSpecified;

  // range
  let range = deepcopy(scaleDef?.range || null);
  let rangeProvided = scaleDef?.range !== undefined;
  if (times && !rangeProvided) {
    range = domain.map(d => d * times);
    rangeProvided = true;
  }// to skip the below changes when `times` is present while range is not.

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

  // polarity (only works when a range is not provided)
  if (!rangeProvided) {
    if (domain[0] < domain[1] && polarity === NEG) {
      range = range.reverse();
    } else if (domain[0] > domain[1] && polarity === POS) {
      range = range.reverse();
    }
  }
  scaleProperties.range = encoding?.range;

  // make function;
  let scaleFunction = scaleTime().domain(domain).range(range);
  let finalScaleFunction = (d) => {
    return scaleFunction(timeLevelFunction(d))
  };
  finalScaleFunction.properties = scaleProperties;
  return finalScaleFunction;
}

export function makeTimeLevelFunction(timeLevel) {
  if (!timeLevel) return (d) => { return new Date(d) };
  else {
    if (timeLevel === 'year') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), 0, 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'month') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), 0, 0, 0, 0, 0);
      }
    } else if (timeLevel === 'date') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
      }
    } else if (timeLevel === 'hour') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 0, 0, 0);
      }
    } else if (timeLevel === 'minute') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), 0, 0);
      }
    } else if (timeLevel === 'second') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), 0);
      }
    } else if (timeLevel === 'millisecond') {
      return (d) => {
        let dt = new Date(d);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds());
      }
    } else {
      return (d) => { return new Date(d) };
    }
  }
}
export function makeTimeUnitFunction(timeUnit, names) {
  if (!timeUnit) return (d) => { return new Date(d) };
  else {
    if (timeUnit === 'year') {
      return (d) => {
        return new Date(d).getFullYear();
      }
    } else if (timeUnit === 'month') {
      names = names || 'number';
      if (names == "number") names = timeUnitDomainDefs.monthNumber;
      else if (names == "number1") names = timeUnitDomainDefs.monthNumber1
      else if (names == "short") names = timeUnitDomainDefs.monthShort;
      else if (names == "long") names = timeUnitDomainDefs.month;
      return (d) => {
        return names[new Date(d).getMonth()];
      }
    } else if (timeUnit === 'day') {
      names = names || timeUnitDomainDefs.dayLong
      if (names == "number") names = timeUnitDomainDefs.dayNumber
      else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
      else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
      else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
      else if (names == "short") names = timeUnitDomainDefs.dayShort;
      return (d) => {
        return names[new Date(d).getDay()];
      }
    } else if (timeUnit === 'date') {
      return (d) => {
        return new Date(d).getDate();
      }
    } else if (timeUnit === 'hour') {
      return (d) => {
        return new Date(d).getHours();
      }
    } else if (timeUnit === 'hour12') {
      return (d) => {
        return new Date(d).getHours() % 12;
      }
    } else if (timeUnit === 'minute') {
      return (d) => {
        return new Date(d).getMinutes();
      }
    } else if (timeUnit === 'second') {
      return (d) => {
        return new Date(d).getSeconds();
      }
    } else if (timeUnit === 'millisecond') {
      return (d) => {
        return new Date(d).getMilliseconds();
      }
    } else {
      return (d) => { return new Date(d) };
    }
  }
}

export function timeUnitDomain(orgDomain, timeUnit, names) {
  if (timeUnit === 'year') {
    return [new Date(orgDomain[0]).getDay(), new Date(orgDomain[1]).getDay()]
  } else if (timeUnit === 'month') {
    names = names || 'number';
    if (names == "number") names = timeUnitDomainDefs.monthNumber;
    else if (names == "number1") names = timeUnitDomainDefs.monthNumber1
    else if (names == "short") names = timeUnitDomainDefs.monthShort;
    else if (names == "long") names = timeUnitDomainDefs.month;
    return names;
  } else if (timeUnit === 'day') {
    names = names || timeUnitDomainDefs.dayLong
    if (names == "number") names = timeUnitDomainDefs.dayNumber
    else if (names == "number1") names = timeUnitDomainDefs.dayNumber1;
    else if (names == "numberFromMon") names = timeUnitDomainDefs.dayNumberFromMon;
    else if (names == "numberFromMon1") names = timeUnitDomainDefs.dayNumberFromMon1;
    else if (names == "short") names = timeUnitDomainDefs.dayShort;
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

const timeUnitDomainDefs = {
  monthNumber: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  monthNumber1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  monthShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthLong: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dayNumber: [0, 1, 2, 3, 4, 5, 6],
  dayNumber1: [1, 2, 3, 4, 5, 6, 7],
  dayNumberFromMon: [6, 0, 1, 2, 3, 4, 5],
  dayNumberFromMon1: [7, 1, 2, 3, 4, 5, 6],
  dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayShort: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
  date: aRange(0, 31, true),
  hour: aRange(0, 24, false),
  hour12: aRange(0, 12, false),
  minute: aRange(0, 60, false),
  second: aRange(0, 60, false),
  millisecond: aRange(0, 100, false)
}