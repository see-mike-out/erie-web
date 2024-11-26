import { AqTableType } from "../types";

export function filterTable(table: AqTableType, filter: string): AqTableType {
  return table.ungroup().filter(`d => ${filter.replace(/datum\./gi, 'd.')}`).reify();
}