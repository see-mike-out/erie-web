export type Datum = {
  [key: string]: any;
}
type DataSpec1 = {
  values: Datum[]
};
type DataSpec2 = {
  url: string
};
export type DataSpec3 = {
  name: string
};

export type DataSpec = DataSpec1 | DataSpec2 | DataSpec3;

export type DatasetSpecItem = {
  name: string,
  values: Datum[]
} | {
  name: string,
  url: string
};

// For streaming data
export type StreamingDataSpec = {
  stream: true,
  test?: DataSpec1 | DataSpec2,
}
