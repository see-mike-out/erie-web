import { Bin, bin, max, min } from "d3";
import { BinObject } from "../types";

export function createBin(col: number[], transform: BinObject): {
  start: number[], end: number[], nBukcets: number, equiBin: boolean
} {
  let is_nice = transform.nice;
  if (is_nice === undefined) is_nice = true;
  let maxbins = transform.maxbins || 10;
  let step = transform.step;
  let exact = transform.exact;
  let binFunction = bin(), buckets: Bin<any, any>[] = [], binAssigner: (d: any) => { start: number, end: number }, equiBin: boolean = true;
  if (is_nice && maxbins && !step) {
    binFunction = binFunction.thresholds(maxbins);
    buckets = binFunction(col);
    equiBin = true;
  } else if (step) {
    maxbins = Math.ceil(((max(col) ?? 0) - (min(col) ?? 0)) / step);
    binFunction = binFunction.thresholds(maxbins);
    buckets = binFunction(col);
    equiBin = true;
  } else if (exact) {
    binFunction = binFunction.thresholds(exact);
    buckets = binFunction(col);
    equiBin = false;
  }
  binAssigner = (d) => {
    let ib = buckets.map(b => (b.includes(d) ? { x0: b.x0, x1: b.x1 } : undefined)).filter(b => b != undefined)?.[0];
    return { start: ib?.x0, end: ib?.x1 };
  }
  let binned = col.map(binAssigner);
  let start = binned.map(d => d.start), end = binned.map(d => d.end);
  return { start, end, nBukcets: buckets.length, equiBin };
}