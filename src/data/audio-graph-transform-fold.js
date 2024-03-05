export function foldTable(table, fold_fields, by, exclude, new_names) {
  let f = table.fold(fold_fields);
  if (exclude) {
    f = f.select(by, 'key', 'value');
  }
  if (new_names) {
    let key = new_names[0] || "key";
    let value = new_names[1] || "value";
    f = f.rename({ key, value });
  }
  return f;
}