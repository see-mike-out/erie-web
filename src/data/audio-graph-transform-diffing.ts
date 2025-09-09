import * as aq from "arquero";
import {
  AqTableType,
  Datum
} from "../types";

export function diffTable(table: AqTableType, fields: string[], groupby: string[], _as?: string[], _keepFirstAsZero?: boolean): AqTableType {
  let keepFirstAsZero = _keepFirstAsZero ?? true;
  let new_field_name: string[] = []
  if (_as && _as.length > 0 && _as.length != fields.length) {
    console.error("The length of 'as' must be the same as the length of 'diffing'.", fields, _as);
  } else if (!_as || _as.length == 0) {
    new_field_name = fields.map(d => (d + "_diff"))
  } else {
    new_field_name = _as;
  }
  let new_field_name_map: { [key: string]: string } = fields.reduce((a, c, i) => {
    a[c] = new_field_name[i];
    return a;
  }, {} as { [key: string]: string })
  let raw_table = table.objects();
  let new_table: Datum[] = raw_table.slice(keepFirstAsZero ? 0 : 1).map((curr: Datum, i: number) => {
    let prev: Datum = keepFirstAsZero ? (i > 0 ? raw_table[i - 1] : {}) : raw_table[i];
    let point: Datum = Object.keys(curr).reduce((a: Datum, c: string) => {
      if (fields.includes(c)) {
        a[new_field_name_map[c]] = (keepFirstAsZero && i == 0) ? 0 : curr[c] - prev[c];
        a[c] = curr[c]; //preserving
      } else {
        a[c] = curr[c]
      }
      return a;
    }, {} as Datum)
    return point;
  })
  table = aq.from(new_table);
  return table;
}