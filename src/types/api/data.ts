import { Datum } from "../spec";

export type DataObject = {
  values: Datum[] | null;
} | {
  url: string | null;
} | {
  name: string | null;
} | {
  streaming: boolean | null;
  test?: { url: string } | { values: Datum[] } | null;
}

export type DataObject_Typed = DataObject & { type: string };

export interface DatasetObject {
  name: string;
  data: DataObject;
}