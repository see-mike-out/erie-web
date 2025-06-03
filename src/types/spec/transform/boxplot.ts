import { GroupbyType } from "./groupby";

// Transform: Boxplot
export interface BoxplotSpec {
  boxplot: string,
  extent?: number | 'min-max',
  invalid?: 'filter' | undefined,
  groupby?: GroupbyType
}
