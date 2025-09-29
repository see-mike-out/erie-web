import { Datum } from "types/spec";

export interface DataObject {
  type: string;
  values?: Datum[] | null;
  url?: string | null;
  name?: string | null;
  streaming?: boolean | null;
  test?: { url: string } | { values: Datum[] } | null;
}

export interface DatasetObject {
  name: string;
  data: DataObject;
}