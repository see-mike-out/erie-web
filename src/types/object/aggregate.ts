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

