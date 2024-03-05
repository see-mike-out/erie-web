import { asc, desc } from "../util/audio-graph-util";

export function makeIndexSortFn(key, order) {
  return (a, b) => {
    let det = order.indexOf(a[key]) - order.indexOf(b[key]);
    if (det != 0) return det;
    return 0;
  }
}

export function makeAscSortFn(key) {
  return (a, b) => {
    return asc(a[key], b[key]);
  }
}

export function makeDescSortFn(key) {
  return (a, b) => {
    return desc(a[key], b[key]);
  }
}
