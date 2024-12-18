import { OctaveKey } from "../sampling";

export const SupportedInstruments = ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"];
export const MultiNoteInstruments = ["piano", "pianoElec", "violin", "metal", "guitar"];
export const SingleNoteInstruments = ["hithat", "snare", "highKick", "lowKick", "clap"];

// below is for detuning
export type OctaveDefinition = {
  octave: number,
  gf: number,
  g: number,
  af: number,
  a: number,
  bf: number,
  b: number,
  c: number,
  cs: number,
  d: number,
  ds: number,
  e: number,
  f: number,
  fs: number,
}

export const noteFreqRange: OctaveDefinition[] = [
  {
    octave: 0,
    gf: 23.12 / 2,
    g: 24.5 / 2,
    af: 25.96 / 2,
    a: 27.5 / 2,
    bf: 29.14 / 2,
    b: 30.87 / 2,
    c: 16.35,
    cs: 17.32,
    d: 18.35,
    ds: 19.45,
    e: 20.6,
    f: 21.83,
    fs: 23.12
  },
  {
    octave: 1,
    gf: 23.12,
    g: 24.5,
    af: 25.96,
    a: 27.5,
    bf: 29.14,
    b: 30.87,
    c: 32.7,
    cs: 34.65,
    d: 36.71,
    ds: 38.89,
    e: 41.2,
    f: 43.65,
    fs: 46.25
  },
  {
    octave: 2,
    gf: 46.25,
    g: 49,
    af: 51.91,
    a: 55,
    bf: 58.27,
    b: 61.74,
    c: 65.41,
    cs: 69.3,
    d: 73.42,
    ds: 77.78,
    e: 82.41,
    f: 87.31,
    fs: 92.5
  },
  {
    octave: 3,
    gf: 92.5,
    g: 98,
    af: 103.83,
    a: 110,
    bf: 116.54,
    b: 123.47,
    c: 130.81,
    cs: 138.59,
    d: 146.83,
    ds: 155.56,
    e: 164.81,
    f: 174.61,
    fs: 185
  },
  {
    octave: 4,
    gf: 185,
    g: 196,
    af: 207.65,
    a: 220,
    bf: 233.08,
    b: 246.94,
    c: 261.63,
    cs: 277.18,
    d: 293.66,
    ds: 311.13,
    e: 329.63,
    f: 349.23,
    fs: 369.99
  },
  {
    octave: 5,
    gf: 369.99,
    g: 392,
    af: 415.3,
    a: 440,
    bf: 466.16,
    b: 493.88,
    c: 523.25,
    cs: 554.37,
    d: 587.33,
    ds: 622.25,
    e: 659.25,
    f: 698.46,
    fs: 739.99
  },
  {
    octave: 6,
    gf: 739.99,
    g: 783.99,
    af: 830.61,
    a: 880,
    bf: 932.33,
    b: 987.77,
    c: 1046.5,
    cs: 1108.73,
    d: 1174.66,
    ds: 1244.51,
    e: 1318.51,
    f: 1396.91,
    fs: 1479.98
  },
  {
    octave: 7,
    gf: 1479.98,
    g: 1567.98,
    af: 1661.22,
    a: 1760,
    bf: 1864.66,
    b: 1975.53,
    c: 2093,
    cs: 2217.46,
    d: 2349.32,
    ds: 2489.02,
    e: 2637.02,
    f: 2793.83,
    fs: 2959.96
  }
];

export const noteScaleOrder = ['gf', 'g', 'af', 'a', 'bf', 'b', 'c', 'cs', 'd', 'ds', 'e', 'f', 'fs'];

export const detuneAmmount = {
  gf: -600,
  g: -500,
  af: -400,
  a: -300,
  bf: -200,
  b: -100,
  c: 0,
  cs: 100,
  d: 200,
  ds: 300,
  e: 400,
  f: 500,
  fs: 600
};
export type RoundedNote = {
  note_name: typeof noteScaleOrder[number],
  prev_note: typeof noteScaleOrder[number],
  next_note: typeof noteScaleOrder[number],
  note_freq: number,
  detune: number
}

// sample
export type LoadedMonoSample = {
  mono: AudioBuffer,
  multiNote: false
};
export type LoadedMultiSample = {
  multiNote: true
} & {
  [key in OctaveKey]: AudioBuffer
};

export type LoadedSample = LoadedMonoSample | LoadedMultiSample;

export type NoiseCoefficient = {
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  p5: number,
  p6: number,
  o: number
}