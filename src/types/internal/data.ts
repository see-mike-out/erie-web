import { RecordObject } from "../generic";
import { DatasetSpecItem } from "../spec";
import * as aq from "arquero";

export type ParsedDatasetObject = DatasetSpecItem;

export type TableInfoObject = {
  bin?: {
    [key: string]: {
      nBuckets: number,
      equiBin: boolean
    }
  },
  aggregate?: {
    [key: string]: {
      method: string,
      groupby: string[]
    }
  }
}

export class InternalData extends Array {
  tableInfo?: RecordObject;

  constructor(arr: Array<any>) {
    super();
  }
}

export type AqTableType = ReturnType<typeof aq.table>;