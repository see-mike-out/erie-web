import { RecordObject } from "../generic";
import { DatasetSpecItem } from "../spec";
import * as aq from "arquero";

export type ParsedDatasetObject = DatasetSpecItem;

export class InternalData extends Array {
  tableInfo?: RecordObject;

  constructor(arr: Array<any>) {
    super();
  }
}

export type AqTableType = ReturnType<typeof aq.table>;