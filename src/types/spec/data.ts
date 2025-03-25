type DataSpec1 = {
  values: any[]
};
type DataSpec2 = {
  url: string
};
export type DataSpec3 = {
  name: string
};

// new spec?
export type StreamingDataSpec = {
  stream: true,
  test?: DataSpec1 | DataSpec2,
}

export type DataSpec = DataSpec1 | DataSpec2 | DataSpec3;

export type DatasetSpecItem = {
  name: string,
  values: any[]
} | {
  name: string,
  url: string
};
