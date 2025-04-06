import { Glyph } from "../compiled";
import { RamperCollection } from "./ramp";

export class AudioFilterPrototype {
  ctx: AudioContext | OfflineAudioContext;
  filter: AudioNode;
  destination: AudioNode;

  constructor(ctx: AudioContext | OfflineAudioContext) {
    this.ctx = ctx;
    this.filter = ctx.createGain();
    this.destination = this.filter as AudioDestinationNode;
  }
  initialize(...args: any[]) {
  }
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}

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
