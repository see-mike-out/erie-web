import { ORD, QUANT, STATIC } from "../scale/audio-graph-scale-constant";

export function isJSON(d) {
  try {
    JSON.parse(d);
    return true;
  } catch {
    return false
  }
}

const TSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*(?:\t\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t\'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*)*$/gi;
export function isTSV(d) {
  return d.match(TSV_format);
}

const CSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/gi;
export function isCSV(d) {
  return d.match(CSV_format);
}

export function jType(v) {
  return v?.constructor.name;
}

export function detectType(values) {
  if (values.every((d) => d?.constructor.name === "Number")) return QUANT;
  else return ORD;
}