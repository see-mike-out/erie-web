export type SamplingItem = {
  [key in NoteKey]?: string;
};

export type NoteValue = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type OctaveValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type OctaveKey = `${NoteValue}${OctaveValue}`
export type NoteKey = OctaveKey | 'mono';

export interface SampledToneObject {
  name: string;
  sample: SamplingItem;
}

export type NoteRange = {
  octave: OctaveValue,
  original_freq?: number,
  freq: number,
  note?: NoteValue
  detune: number
};