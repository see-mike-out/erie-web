export function unique(arr) {
  return Array.from(new Set(arr));
}

export function deepcopy(i) {
  return JSON.parse(JSON.stringify(i));
}

export function firstDefined(vs) {
  for (let v of vs) {
    if (v !== undefined) return v;
  }
  return vs[vs.length - 1];
}

export function aRange(s, e, incl) {
  let o = [];
  if (incl) e = e + 1;
  for (let i = s; i < e; i++) {
    o.push(i);
  }
  return o;
}

export function round(n, d) {
  let e = Math.pow(10, -d);
  return Math.round(n * e) / e;
}
export function floor(n, d) {
  let e = Math.pow(10, -d);
  return Math.floor(n * e) / e;
}


const RidLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
const NRidLetters = RidLetters.length - 1;
export function genRid(n) {
  if (!n) n = 6;
  let rid = [];
  for (let i = 0; i < n; i++) {
    let k = Math.round(Math.random() * NRidLetters);
    rid.push(RidLetters[k]);
  }
  return rid.join('');
}