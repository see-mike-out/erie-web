import { Datum } from "vega";

export {
  type DatasetSpecItem as DatasetSpecItemNormed,
  type TransformListSpec as TransformListNormed,
  type TransformItemSpec as TransformItemNormed
} from "../spec";


export type DataNormed = {
  name: string
} | {
  stream: boolean,
  test?: { values: Datum[] }
};