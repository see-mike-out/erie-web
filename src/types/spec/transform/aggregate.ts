import { AggOpType } from "../../object";
import { GroupbyType } from "./groupby";

// Transform: Aggregate
export interface AggregateItem {
  /**
   * operation name
   */
  op: AggOpType;
  /**
   * field names to aggregate
   */
  field?: string | string[];
  /**
   * new field name (it returns only a single field)
   */
  as: string;
  /**
   * quantile threshold
   */
  p?: any;
}

export interface AggregateSpec {
  aggregate: AggregateItem[];
  groupby?: GroupbyType
}
