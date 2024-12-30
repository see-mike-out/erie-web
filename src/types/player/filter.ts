import { AudioFilterPrototype } from "../../audioFilters";
import { RampFunctionName } from "../encoding";
import { Glyph } from "../internal";
import { RamperCollection } from "./ramp";

export type AudioFilterEncoder = (filter: AudioFilterPrototype, sound: Glyph, startTime: number, rampers?: RamperCollection) => void;

export type AudioFilterFinisher = (filter: AudioFilterPrototype, sound: Glyph, startTime: number, duration: number, rampers?: RamperCollection) => void;


export interface ErieFilterCollectionItem {
  filter: typeof AudioFilterPrototype,
  encoder: AudioFilterEncoder,
  finisher: AudioFilterFinisher,
}
export interface ErieFilterCollection {
  [key: string]: ErieFilterCollectionItem
}
