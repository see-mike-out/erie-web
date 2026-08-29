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

export function aRange(s: number, e: number, incl?: boolean): number[] {
  let o = [];
  if (incl) e = e + 1;
  for (let i = s; i < e; i++) {
    o.push(i);
  }
  return o;
}

