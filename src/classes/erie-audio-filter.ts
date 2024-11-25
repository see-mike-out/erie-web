interface ErieFilterCollectionItem {
  filter: Function,
  encoder: Function,
  finisher: Function,
}
interface ErieFilterCollection {
  [key: string]: ErieFilterCollectionItem
}

export let ErieFilters: ErieFilterCollection = {};

export function registerFilter(name: string, filter: Function, encoder: Function, finisher: Function) {
  ErieFilters[name] = { filter, encoder, finisher };
}