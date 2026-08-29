import { GroupbyType } from "./groupby";

// Transform: Quantile
export interface QuantileSpec {
  quantile: string,
  n?: number,
  step?: number,
  as?: [string, string],
  groupby?: GroupbyType
}