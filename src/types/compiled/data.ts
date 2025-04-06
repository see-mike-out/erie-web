import { RecordObject } from "../generic";
import * as aq from "arquero";
import { Datum } from "../spec";


// data structure for compilation
export type LoadedDatasets = { [key: string]: Datum[] };

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

  constructor(...arr: Array<any>) {
    super(...arr);
  }
}

export type AqTableType = ReturnType<typeof aq.table>;

export type TransformerFunction = (o: any) => any;