import { AqTableType } from "../types";

export function filterTable(table: AqTableType, filter: string): AqTableType {
  return table.ungroup().filter(`datum => ${filter}`).reify();
}