import { AudioFilterEncoder, AudioFilterFinisher, ErieFilterCollection, AudioFilterPrototype } from "../types";

export let ErieFilters: ErieFilterCollection = {};

export function registerFilter(name: string, filter: typeof AudioFilterPrototype, encoder: AudioFilterEncoder, finisher: AudioFilterFinisher) {
  ErieFilters[name] = { filter, encoder, finisher };
}