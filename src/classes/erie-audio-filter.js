export let ErieFilters = {};
export function registerFilter(name, filter, encoder, finisher) {
  ErieFilters[name] = { filter, encoder, finisher };
}