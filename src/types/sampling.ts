export type SamplingItem = {
  [key in NoteKey]?: string;
};

type note = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
type octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type OctaveKey = `${note}${octave}`
export type NoteKey = OctaveKey | 'mono';

export interface SampledToneObject {
  name: string;
  sample: SamplingItem;
}