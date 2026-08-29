import { RecordObject } from "../types";
import {
  asc,
  desc
} from "../util";

export function makeIndexSortFn<T extends RecordObject>(key: string, order: T[]): (a: T, b: T) => number {
  return (a: T, b: T) => {
    let det = order.indexOf(a[key]) - order.indexOf(b[key]);
    if (det != 0) return det;
    return 0;
  }
}

export function makeAscSortFn<T extends RecordObject>(key: string): (a: T, b: T) => number {
  return (a: T, b: T) => {
    return asc(a[key], b[key]);
  }
}

export function makeDescSortFn<T extends RecordObject>(key: string): (a: T, b: T) => number {
  return (a: T, b: T) => {
    return desc(a[key], b[key]);
  }
}
