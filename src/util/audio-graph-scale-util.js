import { DEF_TAPPING_DUR, DEF_TAPPING_DUR_BEAT, DEF_TAP_DUR, DEF_TAP_DUR_BEAT, DEF_TAP_PAUSE_RATE, SINGLE_TAP_MIDDLE, SINGLE_TAP_START, TAPCNT_chn, TAPSPD_chn } from "../scale/audio-graph-scale-constant";
import { jType } from "./audio-graph-typing-util";
import { round } from "./audio-graph-util";

export function makeParamFilter(expr) {
  if (jType(expr) !== "String") return null;
  let base = expr.includes("datum.") ? "datum" : "d";
  if (base === "datum") {
    return Function('datum', "return (" + expr + ");");
  } else {
    return Function('d', "return (" + expr + ");");
  }
}

const tapEndBumper = 0.1

export function makeTapPattern(tapValue, tapType, duration, pause, tappingDur, singleTappingPosition, beat) {
  // tapValue: whatever value computed out of a scale function
  // tapType: 'tapCount' or 'tapSpeed'
  // duration: for 'tapSpeed' channel, it is the total length; for 'tapCount' channel it is each tap's length,
  // pause: pause between tappings (can be rate ({rate: ...}) or length ({length: ...}))
  // tappingDur: for a `tapSpeed` channel, the tapping sound length.
  if (tapValue !== undefined && tapType === TAPCNT_chn) {
    if (!duration && !beat) duration = DEF_TAPPING_DUR;
    else if (!duration && beat && beat.converter) {
      duration = DEF_TAPPING_DUR_BEAT;
    }
    let pauseLength;
    duration = round(duration, -2);
    if (pause?.length !== undefined) pauseLength = pause?.length;
    else if (pause?.rate !== undefined) pauseLength = duration * pause?.rate;
    else pauseLength = duration * DEF_TAP_PAUSE_RATE;
    pauseLength = round(pauseLength, -2);
    let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${tapValue} `;
    for (let i = 0; i < tapValue; i++) {
      pattern.push(duration)
      totalLength += duration;
      if (i < tapValue - 1) {
        totalLength += pauseLength;
        pattern.push(pauseLength);
      } else {
        totalLength += tapEndBumper;
        pattern.push(tapEndBumper);
      }
    }
    if (beat?.converter) pattern = pattern.map(beat?.converter);
    return { pattern, totalLength, patternString };
  } else if (tapValue !== undefined && tapType === TAPSPD_chn) {
    if (!duration && !beat) duration = DEF_TAP_DUR;
    else if (!duration && beat && beat.converter) {
      duration = DEF_TAP_DUR_BEAT;
    }
    let count = round(tapValue * duration, 0);
    let tapOnlyDur = count * tappingDur;
    let pauseLength;
    let pattern = [], totalLength = 0;
    if (count == 0) {
      pauseLength = duration;
      pattern = [0, pauseLength];
      totalLength += pauseLength;
    } else if (count == 1) {
      if (!singleTappingPosition || singleTappingPosition === SINGLE_TAP_MIDDLE) {
        pauseLength = (duration - tappingDur) / 2;
        pauseLength = round(pauseLength, -2);
        pattern = [0, pauseLength, tappingDur, pauseLength];
        totalLength += pauseLength + tappingDur + pauseLength;
      } else {
        pauseLength = duration - tappingDur;
        pauseLength = round(pauseLength, -2);
        if (singleTappingPosition === SINGLE_TAP_START) {
          pattern = [tappingDur, pauseLength];
          totalLength += pauseLength + tappingDur;
        } else if (singleTappingPosition === SINGLE_TAP_START) {
          pattern = [0, pauseLength, tappingDur, tapEndBumper];
          totalLength += pauseLength + tappingDur + tapEndBumper;
        }
      }
    } else {
      pauseLength = (duration - tapOnlyDur) / (count - 1);
      pauseLength = round(pauseLength, -2);
      for (let i = 0; i < count; i++) {
        pattern.push(tappingDur)
        totalLength += tappingDur;
        if (i < count - 1) {
          totalLength += pauseLength;
          pattern.push(pauseLength);
        } else {
          totalLength += tapEndBumper;
          pattern.push(tapEndBumper);
        }
      }
    }
    let patternString = `[${tappingDur}, ${pauseLength}] x ${count}`;
    if (beat?.converter) pattern = pattern.map(beat?.converter);
    return { pattern, totalLength, patternString };
  } else if (tapValue !== undefined && tapType === 'both') {
    let count = round(tapValue.count, 0), speed = tapValue.speed;
    if (!duration && !beat) duration = DEF_TAPPING_DUR;
    else if (!duration && beat && beat.converter) {
      duration = DEF_TAPPING_DUR_BEAT;
    }
    let tapSection = round(1 / speed, -2);
    if (!beat) {
      if (tapSection < 0.12) tapSection = 0.12;
      if (duration > tapSection) duration = round(tapSection * 0.85, -2);
    }
    let pauseLength = round(tapSection - duration, -2);
    let pattern = [], totalLength = 0, patternString = `[${duration}, ${pauseLength}] x ${count} `;
    for (let i = 0; i < count; i++) {
      pattern.push(duration)
      totalLength += duration;
      if (i < count - 1) {
        totalLength += pauseLength;
        pattern.push(pauseLength);
      } else {
        totalLength += tapEndBumper;
        pattern.push(tapEndBumper);
      }
    }
    if (beat?.converter) pattern = pattern.map(beat?.converter);
    return { pattern, totalLength, patternString }
  } else {
    return { pattern: [], totalLength: 0, patternString: `[0, 0] x 0` };
  }
}

export function mergeTapPattern(tapCount, tapSpeed) {
  if (tapCount && tapSpeed) {
    return makeTapPattern({ count: tapCount?.value, speed: tapSpeed?.value }, 'both', tapCount.tapLength, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapCount.beat);
  } else if (tapCount) {
    return makeTapPattern(tapCount?.value, TAPCNT_chn, tapCount.tapLength, tapCount.pause, undefined, undefined, tapCount.beat);
  } else if (tapSpeed) {
    return makeTapPattern(tapSpeed?.value, TAPSPD_chn, tapSpeed.tapDuration, undefined, tapSpeed.tappingUnit, tapSpeed.singleTappingPosition, tapSpeed.beat);
  }
  else { return undefined };
}

export const noteScale = [
  {
    c: 16.35,
    cs: 17.32,
    d: 18.35,
    ds: 19.45,
    e: 20.6,
    f: 21.83,
    fs: 23.12,
    g: 24.5,
    gs: 25.96,
    a: 27.5,
    as: 29.14,
    b: 30.87
  }, {
    c: 32.7,
    cs: 34.65,
    d: 36.71,
    ds: 38.89,
    e: 41.2,
    f: 43.65,
    fs: 46.25,
    g: 49,
    gs: 51.91,
    a: 55,
    as: 58.27,
    b: 61.74,
  }, {
    c: 65.41,
    cs: 69.3,
    d: 73.42,
    ds: 77.78,
    e: 82.41,
    f: 87.31,
    fs: 92.5,
    g: 98,
    gs: 103.83,
    a: 110,
    as: 116.54,
    b: 123.47
  },
  {
    c: 130.81,
    cs: 138.59,
    d: 146.83,
    ds: 155.56,
    e: 164.81,
    f: 174.61,
    fs: 185,
    g: 196,
    gs: 207.65,
    a: 220,
    as: 233.08,
    b: 246.94,
  },
  {
    c: 261.63,
    cs: 277.18,
    d: 293.66,
    ds: 311.13,
    e: 329.63,
    f: 349.23,
    fs: 369.99,
    g: 392,
    gs: 415.3,
    a: 440,
    as: 466.16,
    b: 493.88,
  },
  {
    c: 523.25,
    cs: 554.37,
    d: 587.33,
    ds: 622.25,
    e: 659.25,
    f: 698.46,
    fs: 739.99,
    g: 783.99,
    gs: 830.61,
    a: 880,
    as: 932.33,
    b: 987.77,
  },
  {
    c: 1046.5,
    cs: 1108.73,
    d: 1174.66,
    ds: 1244.51,
    e: 1318.51,
    f: 1396.91,
    fs: 1479.98,
    g: 1567.98,
    gs: 1661.22,
    a: 1760,
    as: 1864.66,
    b: 1975.53,
  },
  {
    c: 2093,
    cs: 2217.46,
    d: 2349.32,
    ds: 2489.02,
    e: 2637.02,
    f: 2793.83,
    fs: 2959.96,
    g: 3135.96,
    gs: 3322.44,
    a: 3520.00,
    as: 3729.31,
    b: 3951.07,
  },
  {
    c: 4186.01,
    cs: 4434.92,
    d: 4698.63,
    ds: 4978.03,
    e: 5274.04,
    f: 5587.65,
    fs: 5919.91,
    g: 6271.93,
    gs: 6644.88,
    a: 7040.00,
    as: 7458.62,
    b: 7902.13,
  }
];

const sharpToFlat = {
  bb: 'as',
  ab: 'gs',
  gb: 'fs',
  fb: 'e',
  eb: 'ds',
  db: 'cs',
  cb: 'b'
}

export function noteToFreq(note) {
  if (jType(note) === "Number") return note;
  if (jType(note) !== "String") return null;
  let n = note[0]?.toLowerCase(), o = note[1], a = note[2]?.toLowerCase();
  if (a === "#") a = "s";
  else if (a === "♭") a = "b";
  if (o > 8) return null;
  if (a === "b") {
    let na = sharpToFlat[n + a];
    n = na[0];
    a = na[1];
    if (na == 'b') o = o - 1;
  }
  if (n + a === 'bs') {
    n = 'c';
    a = undefined;
  } else if (n + a === 'es') {
    n = 'f';
    a = undefined;
  }
  if (o < 0) return null;
  return noteScale[o][n + (a || '')];
}