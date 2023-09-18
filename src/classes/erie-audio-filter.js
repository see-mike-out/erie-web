window.registeredFilters = {};
export function registerFilter(name, filter, encoder, finisher) {
  window.registeredFilters[name] = { filter, encoder, finisher};
}