import { AudioFilterPrototype } from "../../audioFilters";
import { Glyph } from "../internal";

export type AudioFilterEncoder = (filter: AudioFilterPrototype, sound: Glyph, startTime: number) => void;

export type AudioFilterFinisher = (filter: AudioFilterPrototype, sound: Glyph, startTime: number, duration: number) => void;


export interface ErieFilterCollectionItem {
  filter: typeof AudioFilterPrototype,
  encoder: AudioFilterEncoder,
  finisher: AudioFilterFinisher,
}
export interface ErieFilterCollection {
  [key: string]: ErieFilterCollectionItem
}
