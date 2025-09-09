import { GroupbyType } from "./groupby";

// Transform: Calculate
export interface DiffingSpec {
  /** 
   * field name
   */
  diffing: string[];
  /** 
   * Carriover
   */
  carryOver?: boolean;
  /**
   * new field name
   */
  as?: string[];
  /**
   * group the resulting calculations by a field(s)
   */
  groupby?: GroupbyType;
  /**
   * first element to be zero
   */
  keepFirstAsZero?: boolean;
}