import { deepcopy } from "./audio-graph-util";

export function listString(arr, delim, isAnd, _and) {
  if (arr.length == 0) return "";
  else if (arr.length == 1) return arr[0];
  else if (arr.length == 2 && isAnd) return `${arr[0]} ${_and || 'and'} ${arr[1]}`;
  else if (arr.length == 2 && !isAnd) return `${arr[0]}${delim || ' '}${arr[1]} `;
  else if (!isAnd) {
    return arr.join(delim);
  } else {
    let last = arr[arr.length - 1];
    let rest = arr.slice(0, arr.length - 1);
    return rest.join(delim) + delim + `${_and || 'and'}` + last;
  }
}

export function toOrdinalNumbers(n) {
  // upto 23
  return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth",
    "tenth", "eleventh", "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth",
    "twentieth", "twenty-first", "twenty-second", "twenty-third"][n] || n + "th"
}

export function toHashedObject(a, k, dp) {
  let o = {};
  a.forEach((d) => {
    let t = {};
    if (dp) {
      t = deepcopy(d);
    } else {
      Object.assign(t, d);
    }
    o[d[k]] = t;
  });
  return o;
}