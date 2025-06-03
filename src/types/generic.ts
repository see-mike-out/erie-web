export type RecordObject = {
  [key: string]: any;
}

export type HashedObject<T> = {
  [key: string]: T;
}