/** General: Aggregation names */
export const
  COUNT = 'count',
  VALID = 'valid', DISTINCT = 'distinct',
  MEAN = 'mean', AVG = 'average', MODE = 'mode', MEDIAN = 'median',
  QUANTILE = 'quantile', STDEV = 'stdev', STDEVP = 'stdevp',
  VARIANCE = 'variance', VARIANCEP = 'variancep',
  SUM = 'sum', PRODUCT = 'product', MAX = 'max', MIN = 'min',
  CORR = 'corr', COVARIANCE = 'covariance', COVARIANCEP = 'covariancep';

/** General: Aggregation types */
export const ZeroOPs = [
  COUNT
];
export const SingleOps = [
  VALID, DISTINCT, MEAN, AVG, MODE, MEDIAN,
  QUANTILE, STDEV, STDEVP, VARIANCE, VARIANCEP,
  SUM, PRODUCT, MAX, MIN
];
export const DoubleOps = [
  CORR, COVARIANCE, COVARIANCEP
];
export type ZeroAggOpType = typeof ZeroOPs[number];
export type SingleAggOpType = typeof SingleOps[number];
export type DoubleAggOpType = typeof DoubleOps[number];
export type AggOpType = ZeroAggOpType | SingleAggOpType | DoubleAggOpType;
export const Auto = "auto"

/** Transform objects */

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

export interface AggregateObject {
  aggregate: AggregateItem[];
  groupby?: string[] | typeof Auto;
}

// Transform: Bin
export interface BinObject {
  /**
   * field name to bin
   */
  bin: string,
  /**
   * new field name for the start point
   */
  as?: string,
  /**
   * new field name for the end point
   */
  end?: string,
  /**
   * nice bin buckets
   */
  nice?: boolean,
  /**
   * the max number of bins
   */
  maxbins?: number,
  /**
   * exact bin steps
   */
  step?: number,
  /**
   * exact bin buckets (should alway include the beggining and the end point)
   */
  exact?: number[],
  /**
   * reserved for rendering purposes (won't do anything when provided via spec)
   */
  auto?: boolean
}

// Transform: Calculate
export interface CalculateObject {
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
  groupby?: string[] | typeof Auto;
}

// Transform: Density
export interface DensityObject {
  /**
   * field name to compute density
   */
  density: string;
  /**
   * the range of density calculation
   */
  extent?: number[];
  /**
   * group the resulting densities by a field(s)
   */
  groupby?: string[];
  /**
   * whether to make cumulative density
   */
  cumulative?: boolean;
  /**
   * whether to compute density as count
   */
  counts?: boolean;
  /**
   * kernel bandwidth
   */
  bandwidth?: number;
  /**
   * the minimum number of sampled values
   */
  minsteps?: number;
  /**
   * the maximum number of sampled values
   */
  maxsteps?: number;
  /**
   * the exact number of sampled values
   */
  steps?: number;
  /**
   * the resulting field name
   */
  as?: [string, string];
}

// Transform: Filter
export interface FilterObject {
  /**
   * filter expression
   */
  filter: string;
}

// Transform: Fold
export interface FoldObject {
  /**
   * field(s) to fold
   */
  fold: string[];
  /**
   * the field name to fold by
   */
  by: string;
  /**
   * whether to drop (true) other fields (default:false)
   */
  exclude?: boolean;
  /**
   * new field names for the folded variables ([key, name] order)
   */
  as?: [string, string];
}

// Transform: Boxplot
export interface BoxplotObject {
  boxplot: string,
  extent?: number | 'min-max',
  invalid?: 'filter' | undefined,
  groupby?: string[] | typeof Auto;
}

// Transform: Quantile
export interface QuantileObject {
  quantile: string,
  n: number,
  step: number,
  as?: [string, string],
  groupby?: string[] | typeof Auto
}

// Transform: Generalized
export type TransformItem = AggregateObject
  | BinObject
  | CalculateObject
  | DensityObject
  | FilterObject
  | FoldObject
  | BoxplotObject
  | QuantileObject;

export type TransformList = Array<TransformItem>


/** Inline transforms */

// Inline: Bin
interface InlineBin1 {
  /**
   * the number of maximum bins
   */
  maxbins?: number,
  /**
   * whether to use "nice" buckets
   */
  nice?: boolean,
  /**
   * the exact steps
   */
  step?: number
}
interface InlineBin2 {
  /**
   * the exact bucketes
   */
  exact: number[]
}

// inline bin can be specified as true/false.
export type InlineBinType = boolean | InlineBin1 | InlineBin2;
