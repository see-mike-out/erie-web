export interface OctaveObject {
  c: number;
  cs: number;
  d: number;
  ds: number;
  e: number;
  f: number;
  fs: number;
  g: number;
  gs: number;
  a: number;
  as: number;
  b: number;
}
export type NoteNames = keyof OctaveObject;