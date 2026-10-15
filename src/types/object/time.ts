import { bcp47language } from "./speech";

export const timeUnitDomainDefs = {
  monthNumber: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  monthNumber1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  monthShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthLong: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  dayNumber: [0, 1, 2, 3, 4, 5, 6],
  dayNumber1: [1, 2, 3, 4, 5, 6, 7],
  dayNumberFromMon: [6, 0, 1, 2, 3, 4, 5],
  dayNumberFromMon1: [7, 1, 2, 3, 4, 5, 6],
  dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  date: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
  ],
  hour: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ],
  hour12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  minute: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  ],
  second: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  ],
  millisecond: Array.from({ length: 1000 }, (_, i) => i)
}

export type timeLevelValues = 'year' | 'month' | 'date' | 'hour' | 'minute' | 'second' | 'millisecond';

export const TU_SEC = "second",
  TU_BEAT = "beat";

export type TimeUnitUnits = typeof TU_SEC
  | typeof TU_BEAT;

export const TU_Always = 'always',
  TU_Start = 'start',
  TU_Never = 'never';

export interface TimeUnit {
  unit: typeof TU_SEC | typeof TU_BEAT,
  tempo?: number,
  rounding?: typeof TU_Always | typeof TU_Start | typeof TU_Never;
  roundingBy?: number;
}

export function isTimeUnit(o: Object): o is TimeUnit {
  if (!('unit' in o)) {
    return false;
  } else {
    if (o.unit !== TU_SEC && o.unit !== TU_BEAT) {
      return false;
    }
  }
  if ('tempo' in o) {
    if (typeof o.tempo !== 'number') {
      return false;
    }
  }
  if ('rounding' in o) {
    if (typeof o.rounding !== 'string') {
      return false;
    }
    if (![TU_Always, TU_Start, TU_Never].includes(o.rounding)) {
      return false;
    }
  }
  if ('roundingBy' in o) {
    if (typeof o.roundingBy !== 'number') {
      return false;
    }
  }
  return true;
}

export function getPresetTimeUnitValues(
  unit: "month" | "day",
  nameset: string | string[] | number[] | undefined,
  locale?: typeof bcp47language[number]
): any[] {
  if (nameset instanceof Array) {
    return nameset;
  } else if (unit === 'month') {
    switch (nameset) {
      case "number":
        return timeUnitDomainDefs.monthNumber;
      case "number1":
        return timeUnitDomainDefs.monthNumber1;
      case "short":
        return locale ? timeUnitDomainDefs.monthNumber.map((i) => {
          return new Intl.DateTimeFormat(locale, { month: "short" }).formatToParts(new Date(1970, i))[0].value
        }) : timeUnitDomainDefs.monthShort;
      case "long":
        return locale ? timeUnitDomainDefs.monthNumber.map((i) => {
          return new Intl.DateTimeFormat(locale, { month: "long" }).formatToParts(new Date(1970, i))[0].value
        }) : timeUnitDomainDefs.monthLong;
      default:
        return timeUnitDomainDefs.monthNumber;
    }
  } else if (unit === 'day') {
    switch (nameset) {
      case "number":
        return timeUnitDomainDefs.dayNumber;
      case "number1":
        return timeUnitDomainDefs.dayNumber1;
      case "numberFromMon":
        return timeUnitDomainDefs.dayNumberFromMon;
      case "numberFromMon1":
        return timeUnitDomainDefs.dayNumberFromMon1;
      case "short":
        return locale ? timeUnitDomainDefs.dayNumber.map((i) => {
          return new Intl.DateTimeFormat(locale, { weekday: "short" }).formatToParts(new Date(1970, 0, 4 + i))[0].value
        }) : timeUnitDomainDefs.dayShort;
      case "long":
        return locale ? timeUnitDomainDefs.dayNumber.map((i) => {
          return new Intl.DateTimeFormat(locale, { weekday: "long" }).formatToParts(new Date(1970, 0, 4 + i))[0].value
        }) : timeUnitDomainDefs.dayLong;
      default:
        return locale ? timeUnitDomainDefs.dayNumber.map((i) => {
          return new Intl.DateTimeFormat(locale, { weekday: "long" }).formatToParts(new Date(1970, 0, 4 + i))[0].value
        }) : timeUnitDomainDefs.dayLong;
    }
  } else {
    throw new TypeError("Unsupported unit name");
  }
}