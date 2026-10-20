import * as aq from "arquero";
import {
  AqTableType,
  Datum
} from "../types";
import { unique } from "../util";

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
  }, {} as { [key: string]: string });
  let raw_tables: Map<string, object[]>;
  if (groupby && groupby.length > 0) {
    raw_tables = custom_groupby_function(table, groupby);
  } else {
    raw_tables = new Map([['none', table.objects()]])
  }

  let new_table: Datum[] = []
  for (const tab of raw_tables) {
    let tabkey = tab[0];
    let raw_table = tab[1];
    let new_table_section: Datum[] = raw_table.slice(keepFirstAsZero ? 0 : 1).map((curr: Datum, i: number) => {
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
    });
    new_table = [...new_table, ...new_table_section]
  }
  table = aq.from(new_table);
  return table;
}

function custom_groupby_function(table: AqTableType, groupby: string[]) {
  let uniques: { [key: string]: any[] } = {};
  for (const colname of groupby) {
    let col = table.array(colname);
    let uniq = unique(col);
    uniques[colname] = uniq;
  }
  let sect_tables: Map<string, object[]> = new Map();
  let raw = table.objects();
  let colname0 = groupby[0];
  for (const key of uniques[colname0]) {
    sect_tables.set(`${colname0}=>${key}`, raw.filter((d: any) => d[colname0] === key));
  }
  if (groupby.length - 1 > 0) {
    sect_tables = recursive_groupby(sect_tables, groupby.slice(1), uniques);
  }
  return sect_tables;
}

function recursive_groupby(
  sect_tables: Map<string, object[]>,
  groupby: string[],
  uniques: { [key: string]: any[] }
): Map<string, object[]> {
  let new_sect_tables: Map<string, object[]> = new Map();
  let colname0 = groupby[0];
  for (const item of sect_tables) {
    let [org_key, org_table] = item;
    for (const key of uniques[colname0]) {
      new_sect_tables.set(org_key + `;${colname0}=>${key}`, org_table.filter((d: any) => d[colname0] === key));
    }
  }
  if (groupby.length - 1 > 0) {
    new_sect_tables = recursive_groupby(new_sect_tables, groupby.slice(1), uniques);
  }
  return new_sect_tables;
}