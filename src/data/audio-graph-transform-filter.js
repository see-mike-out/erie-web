export function filterTable(table, filter) {
  return table.ungroup().filter(`d => ${filter.replace(/datum\./gi, 'd.')}`).reify();
}