import {
  Bin,
  bin,
  bisectRight,
  max,
  min,
  nice,
  range
} from "d3";
import { BinObject } from "../types";

export function createBin(
  col: number[],
  transform: BinObject
): {
  start: number[],
  end: number[],
  nBuckets: number,
  equiBin: boolean
} {
  let is_nice = transform.nice;
  if (is_nice === undefined) is_nice = true;
  let maxbins = transform.maxbins || 10;
  let step = transform.step;
  let exact = transform.exact;
  let binFunction = bin(),
    buckets: Bin<any, any>[] = [],
    binAssigner: (d: any) => { start: number, end: number },
    equiBin: boolean = true;
  if (exact) {
    binFunction = binFunction.thresholds(exact);
    buckets = binFunction(col);
    equiBin = false;
  } else if (step) {
    let bin_sets = range(Math.floor((min(col) ?? 0) / step) * step, (max(col) ?? 0) + step, step)
    binFunction = binFunction.thresholds(bin_sets);
    buckets = binFunction(col);
    equiBin = true;
  } else if (maxbins) {
    binFunction = binFunction.thresholds(maxbins);
    buckets = binFunction(col);
    equiBin = true;
  }
  if (is_nice) {
    let nice_buckets: number[] = nice(max(col) ?? 0, min(col) ?? 0, maxbins);
    binFunction = binFunction.domain([min(nice_buckets) ?? 0, max(nice_buckets) ?? 0])
    buckets = binFunction(col);
  } else {
    binFunction = binFunction.domain([min(col) ?? 0, max(col) ?? 0])
    buckets = binFunction(col);
  }
  let simple_buckets = buckets.map(b => b.x0);
  binAssigner = (d) => {
    let ibx = bisectRight(simple_buckets, d);
    let ib = buckets[ibx - 1]
    return { start: ib?.x0, end: ib?.x1 };
  }
  let binned = col.map(binAssigner);
  let start = binned.map(d => d.start), end = binned.map(d => d.end);
  return { start, end, nBuckets: buckets.length, equiBin };
}
