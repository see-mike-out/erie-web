import {
  DatasetSpecItem,
  DataSpec,
  EncodingType,
  ORD,
  QUANT
} from "../types";
import { deepcopy } from "./audio-graph-util";

export function isJSON(d: string) {
  try {
    JSON.parse(d);
    return true;
  } catch {
    return false
  }
}

const TSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*(?:\t\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t\'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*)*$/gi;
export function isTSV(d: string) {
  return d.match(TSV_format);
}

const CSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/gi;
export function isCSV(d: string) {
  return d.match(CSV_format);
}

export function detectType(values: any[]): EncodingType {
  if (values.every((d) => d?.constructor.name === "Number")) return QUANT;
  else return ORD;
}

export function addURLtoDataObject<T extends DataSpec | DatasetSpecItem>(data: T, dataBaseUrl: string | undefined): T {
  let d = deepcopy(data);
  if (dataBaseUrl && 'url' in d && d.url) {
    let n = URL.parse(d.url, dataBaseUrl);
    if (n) d.url = n.href as string;
  }
  return d;
}