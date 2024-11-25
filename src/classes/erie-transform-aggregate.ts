import {
  AggOpType,
  AggregateItem,
  AggregateObject,
  DoubleOps,
  QUANTILE,
  SingleOps,
  ZeroOPs
} from "../types";
import { deepcopy } from "../util";

export class Aggregate {
  aggregate: AggregateItem[];
  _groupby: string[];

  constructor() {
    this.aggregate = [];
    this._groupby = [];
  }

  add(op: AggOpType, field: string | string[], as: string, p?: any) {
    if (ZeroOPs.includes(op)) {
      if (field?.constructor.name !== 'String') {
        throw new Error('"as" is not provided.')
      }
      this.aggregate.push({
        op, as: <string>field
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
        !(<Array<any>>field).every(f => f?.constructor.name !== 'String')) {
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

  groupby(...args: any) {
    // this function resets groupby
    if (args.length == 1 &&
      args[0].constructor.name === 'Array' &&
      args[0].every((a: any) => a.constructor.name === 'String')) {
      this._groupby = [...args[0]];
    } else if (args.length >= 1 &&
      args.every((a: any) => a.constructor.name === 'String')) {
      this._groupby = [...args];
    }

    return this;
  }

  get(): AggregateObject {
    return {
      aggregate: deepcopy(this.aggregate),
      groupby: deepcopy(this._groupby)
    };
  }

  clone(): Aggregate {
    let _c = new Aggregate();
    _c.aggregate = deepcopy(this.aggregate);
    _c._groupby = deepcopy(this._groupby);
    return _c;
  }
}