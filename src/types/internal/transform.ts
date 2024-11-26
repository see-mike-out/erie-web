import { SortValues } from "../encoding";

type DataOrderingItem1 = {
  key: string,
  order: any[]
};

type DataOrderingItem2 = {
  key: string,
  sort: SortValues;
};

export type DataOrderingItem = DataOrderingItem1 | DataOrderingItem2;