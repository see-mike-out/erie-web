import { GroupbyType } from "./groupby";

// Transform: Calculate
export interface CalculateSpec {
  /** 
   * Calculation formula (in JS format)
   */
  calculate: string;
  /**
   * new field name
   */
  as: string;
  /**
   * group the resulting calculations by a field(s)
   */
  groupby?: GroupbyType
}