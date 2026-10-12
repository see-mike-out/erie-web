import { TopLevelSpec } from "../types";

export function isInstanceOf(o: any, c: any, strict?: boolean): boolean {
  // @strict: only for objects
  if (o === undefined && c === undefined) {
    return true;
  } else if (o === null && c === null) {
    return true;
  } else if (!strict && o instanceof Object && !(o instanceof Array)) {
    return o instanceof c;
  } else {
    return o?.constructor === c;
  }
}

export function isArrayOf(o: any, c: any, strict?: boolean): boolean {
  if (isInstanceOf(o, Array)) {
    if (isInstanceOf(c, Array)) {
      return o.every((d: any) => c.includes(d.constructor));
    } else {
      return o.every((d: any) => isInstanceOf(d, c, strict));
    }
  } else {
    return false;
  }
}

export function parseGroupby(...args: any) {
  // this function resets groupby
  if (args.length == 1 && args[0] == "auto") {
    return "auto";
  } else if (args.length == 1 &&
    args[0].constructor.name === 'Array' &&
    args[0].every((a: any) => a.constructor.name === 'String')) {
    return [...args[0]];
  } else if (args.length >= 1 &&
    args.every((a: any) => a.constructor.name === 'String')) {
    return [...args];
  } else {
    throw new TypeError("Unsupported groupby value.")
  }
}

// @ts-ignore
const ResourceKeys: Array<keyof TopLevelSpec> = ["tick", "synth", "sampling", "wave", "transform", "datasets"];
export function clearResources<T extends TopLevelSpec>(spec: T): T {
  for (const k of ResourceKeys) {
    if (k in spec) {
      if (spec[k]?.length == 0) {
        delete spec[k];
      }
    }
  }
  return spec;
}