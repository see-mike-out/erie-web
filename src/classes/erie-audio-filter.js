window.registeredFilters = {};
export function registerFilter(name, filter, encoder, finsiher) {
  window.registeredFilters[name] = { filter, encoder, finsiher};
}