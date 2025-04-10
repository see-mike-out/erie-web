import { Datum } from "vega";

export {
  type DatasetSpecItem as DatasetSpecItemNormed,
  type TransformListSpec as TransformListNormed,
  type TransformItemSpec as TransformItemNormed
} from "../spec";


export type DataNormed = DataNormed1 | DataNormed2;

export type DataNormed1 = {
  name: string
};

export type DataNormed2 = {
  stream: boolean,
  test?: { values: Datum[] }
};