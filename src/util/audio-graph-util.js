export function unique(arr) {
  return Array.from(new Set(arr));
}

export function deepcopy(i) {
  return JSON.parse(JSON.stringify(i));
}

export function firstDefined(...vs) {
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

export function getFirstDefined(...args) {
  for (const arg of args) {
    if (arg !== undefined) return arg;
  }
  return args[args.length - 1];
}

export function asc(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  else if (a?.constructor.name === Date.name && b?.constructor.name === Date.name) return a - b;
  else if (a?.localeCompare) return a.localeCompare(b);
  else return a > b || 0;
}
export function desc(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return b - a;
  else if (a?.constructor.name === Date.name && b?.constructor.name === Date.name) return b - a;
  else if (b?.localeCompare) return b.localeCompare(a);
  else return b > a || 0;
}