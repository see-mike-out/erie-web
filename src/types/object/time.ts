export const timeUnitDomainDefs = {
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
  millisecond: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
    70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
    80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
    90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  ]
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