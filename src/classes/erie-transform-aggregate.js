import { deepcopy } from "./erie-util";

const
  COUNT = 'count',
  VALID = 'valid', DISTINCT = 'distinct',
  MEAN = 'mean', AVG = 'average', MODE = 'mode', MEDIAN = 'median',
  QUANTILE = 'quantile', STDEV = 'stdev', STDEVP = 'stdevp',
  VARIANCE = 'variance', VARIANCEP = 'variancep',
  SUM = 'sum', PRODUCT = 'product', MAX = 'max', MIN = 'min',
  CORR = 'corr', COVARIANCE = 'covariance', COVARIANCEP = 'covariancep';
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

export class Aggregate {
  constructor() {
    this.aggregate = [];
    this._groupby = [];
  }

  add(op, field, as, p) {
    if (ZeroOPs.includes(op)) {
      if (field?.constructor.name !== 'String') {
        throw new Error('"as" is not provided.')
      }
      this.aggregate.push({
        op, as: field
      });
    } else if (SingleOps.includes(op)) {
      if (field === undefined || field?.constructor.name !== 'String') {
        throw new Error('"field" is not properly provided.')
      }
      if (as === undefined || as?.constructor.name !== 'String') {
        throw new Error('"as" is not properly provided.')
      }
      if (op === QUANTILE) {
        if (p === undefined) {
          console.warn('p is not provided, so is set as 0.5.')
          p = 0.5;
        }
        this.aggregate.push({
          op, field, as, p
        });
      } else {
        this.aggregate.push({
          op, field, as
        });
      }
    } else if (DoubleOps.includes(op)) {
      if (field === undefined ||
        field?.constructor.name !== 'Array' ||
        field?.length != 2 ||
        !field.every(f => f?.constructor.name !== 'String')) {
        throw new Error('"field" is not properly provided.')
      }
      if (as === undefined || as?.constructor.name !== 'String') {
        throw new Error('"as" is not properly provided.')
      }
      this.aggregate.push({
        op, field: [...field], as
      });
    } else {
      throw new Error(`Unsupported operation type: ${op}`);
    }

    return this;
  }

  groupby(...args) {
    // this function resets groupby
    if (args.length == 1 &&
      args[0].constructor.name === 'Array' &&
      args[0].every((a) => a.constructor.name === 'String')) {
      this._groupby = [...args[0]];
    } else if (args.length >= 1 &&
      args.every((a) => a.constructor.name === 'String')) {
      this._groupby = [...args];
    }

    return this;
  }

  get() {
    return {
      aggregate: deepcopy(this.aggregate),
      groupby: deepcopy(this._groupby)
    };
  }

  clone() {
    let _c = new Aggregate();
    _c.aggregate = deepcopy(this.aggregate);
    _c._groupby = deepcopy(this._groupby);
  }
}