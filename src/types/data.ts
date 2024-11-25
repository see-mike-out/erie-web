export interface DataObject {
  type: string;
  values?: any[] | null;
  url?: string | null;
  name?: string | null;
}

export interface DatasetObject {
  name: string;
  data: DataObject;
}