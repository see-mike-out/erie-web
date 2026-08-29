import { AqTableType } from "../types";

export function foldTable(table: AqTableType, fold_fields: string[], by: string, exclude: boolean | undefined, new_names: [string, string] | undefined): AqTableType {
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