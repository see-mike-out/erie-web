// sample
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

export const SupportedInstruments = ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"];
export const MultiNoteInstruments = ["piano", "pianoElec", "violin", "metal", "guitar"];
export const SingleNoteInstruments = ["hithat", "snare", "highKick", "lowKick", "clap"];
