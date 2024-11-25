export function isInstanceOf(o: any, c: any): boolean {
  return o?.constructor == c;
}

export function isInstanceOfByName(o: any, c: string): boolean {
  return o?.constructor?.name === c;
}

export function isArrayOf(o: any, c: any): boolean {
  if (isInstanceOf(o, Array)) {
    if (isInstanceOf(c, Array)) {
      return o.every((d: any) => c.includes(d.constructor));
    } else {
      return o.every((d: any) => isInstanceOf(d, c));
    }
  } else {
    return false;
  }
}