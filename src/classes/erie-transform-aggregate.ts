import {
  AggOpType,
  AggregateItem,
  AggregateObject,
  DoubleOps,
  QUANTILE,
  SingleOps,
  ZeroOPs
} from "../types";
import { deepcopy, dropUndefined } from "../util";
import { parseGroupby } from "./erie-util";

export class Aggregate {
  aggregate: AggregateItem[];
  _groupby: string[] | "auto";

  constructor() {
    this.aggregate = [];
    this._groupby = [];
  }

  add(op: AggOpType, field?: string | string[], $as?: string, p?: any) {
    if (ZeroOPs.includes(op)) {
      let _as = <string>field ?? $as ?? op;
      this.aggregate.push({
        op, as: _as
      });
    } else if (SingleOps.includes(op)) {
      if (field === undefined || field?.constructor.name !== 'String') {
        throw new TypeError('"field" is not properly provided.')
      }
      if ($as === undefined || $as?.constructor.name !== 'String') {
        throw new TypeError('"as" is not properly provided.')
      }
      if (op === QUANTILE) {
        if (p === undefined) {
          console.warn('p is not provided, so is set as 0.5.')
          p = 0.5;
        } else if (p < 0 || p > 1) {
          throw new RangeError(`The quantile parameter (p) must be within [0, 1]. Current: ${p}.`)
        }
        this.aggregate.push({
          op, field, as: $as, p
        });
      } else {
        this.aggregate.push({
          op, field, as: $as
        });
      }
    } else if (DoubleOps.includes(op)) {
      if (field === undefined ||
        field?.constructor.name !== 'Array' ||
        field?.length != 2 ||
        !(<Array<any>>field).every(f => f?.constructor.name == 'String')) {
        throw new Error('"field" is not properly provided.')
      }
      if ($as === undefined || $as?.constructor.name !== 'String') {
        throw new Error('"as" is not properly provided.')
      }
      this.aggregate.push({
        op, field: [...field], as: $as
      });
    } else {
      throw new Error(`Unsupported operation type: ${op}`);
    }

    return this;
  }

  groupby(...args: any) {
    // this function resets groupby
    this._groupby = parseGroupby(...args);
    return this;
  }

  get(): AggregateObject {
    return dropUndefined({
      aggregate: deepcopy(this.aggregate.map(d => dropUndefined(d))),
      groupby: deepcopy(this._groupby)
    });
  }

  clone(): Aggregate {
    let _c = new Aggregate();
    _c.aggregate = deepcopy(this.aggregate);
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}