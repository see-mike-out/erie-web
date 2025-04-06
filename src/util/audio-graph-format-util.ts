import { HashedObject, RecordObject } from "../types";
import { deepcopy } from "./audio-graph-util";

export function listString(arr: any[], delim: string, isAnd: boolean, _and?: string): string {
  if (arr.length == 0) return "";
  else if (arr.length == 1) return arr[0];
  else if (arr.length == 2 && isAnd) return `${arr[0]} ${_and || 'and'} ${arr[1]}`;
  else if (arr.length == 2 && !isAnd) return `${arr[0]}${delim || ' '}${arr[1]} `;
  else if (!isAnd) {
    return arr.join(delim);
  } else {
    let last = arr[arr.length - 1];
    let rest = arr.slice(0, arr.length - 1);
    let space_before_and = delim.endsWith(' ');
    return rest.join(delim) + delim + `${space_before_and ? '' : ' '}${_and?.trim() || 'and'} ` + last;
  }
}

export function toOrdinalNumbers(n: number): string {
  // upto 23
  return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth",
    "tenth", "eleventh", "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth",
    "twentieth", "twenty-first", "twenty-second", "twenty-third"][n] || n + "th"
}
/**
 * convert an array of objects to an dict-like object of objects
 * @param a 
 * @param k 
 * @param dp 
 * @returns 
 */
export function toHashedObject<T extends RecordObject>(a: T[], k: string, dp?: boolean): HashedObject<T> {
  let o: { [key: string]: T } = {};
  a.forEach((d: T) => {
    let key = d[k];
    if (dp) {
      o[key] = deepcopy(d);
    } else {
      o[key] = d;
    }
  });
  return o;
}

export function bufferToArrayBuffer(x: any[]) {
  let arrayBuffer = new ArrayBuffer(x.length);
  let arr = new Uint8Array(arrayBuffer);

  for (let i = 0; i < x.length; ++i) {
    arr[i] = x[i];
  }
  return arrayBuffer;
}