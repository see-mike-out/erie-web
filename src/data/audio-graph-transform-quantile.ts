import * as aq from "arquero";
import { round } from "../util/audio-graph-util";
import { AqTableType, RecordObject } from "../types";
const fromTidy = aq.from;

export function generateQuantiles(
  _table: AqTableType,
  field: string,
  _n: number,
  _step: number,
  groupby: string[],
  _as?: [string, string]): AqTableType {
  if (field) {
    let table = _table.reify();
    let n = 25, step = 1 / 25;
    if (_n !== undefined) {
      n = _n;
      step = 1 / n;
    } else if (_step !== undefined && 0 < _step && _step < 1) {
      n = Math.round(1 / _step);
      step = 1 / n;
    }
    let asName: [string, string] = _as ? [_as[0] ?? 'probability', _as[1] ?? 'value'] : ['probability', 'value'];
    let p_names: string[] = [];
    let quantile_rollups: RecordObject = {};
    let bumper = (step as number) / 2;
    for (let i = 0; i < n; i++) {
      let q = round((bumper + i * step), -5);
      p_names.push('q_' + (q).toString())
      quantile_rollups['q_' + (q).toString()] = `d => op.quantile(d['${field}'], ${q})`;
    }
    for (const g of groupby) {
      quantile_rollups[g] = `d => op.mode(d['${g}'])`
    }
    if (groupby && groupby.length > 0) table = table.groupby(groupby);
    table = table.rollup(quantile_rollups);
    table = table.fold(p_names);

    // cleaning
    let records: RecordObject[] = table.objects();
    let new_records = records.map((d) => {
      let o: RecordObject = {};
      for (const g of groupby) {
        o[g] = d[g];
      }
      o[asName[0]] = parseFloat(d.key.split("_")[1]);
      o[asName[1]] = round(d.value, -5);
      return o;
    })
    return fromTidy(new_records);
  } else {
    return _table;
  }
}