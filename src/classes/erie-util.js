export function deepcopy(o) {
  return JSON.parse(JSON.stringify(o || null));
}

export function isInstanceOf(o, c) {
  return o?.constructor == c;
}

export function isInstanceOfByName(o, c) {
  return o?.constructor?.name === c;
}

export function isArrayOf(o, c) {
  if (isInstanceOf(o, Array)) {
    if (isInstanceOf(c, Array)) {
      return o.every((d) => c.includes(d.constructor));
    } else {
      return o.every((d) => isInstanceOf(d, c));
    }
  } else {
    return false;
  }
}