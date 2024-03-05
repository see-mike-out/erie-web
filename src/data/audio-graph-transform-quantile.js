import * as aq from "arquero";
import { round } from "../util/audio-graph-util";
const fromTidy = aq.from;

export function generateQuantiles(_table, field, _n, _step, groupby, _as) {
  if (field) {
    let table = _table.reify();
    let n, step;
    if (_n !== undefined) {
      n = _n;
      step = 1 / n;
    } else if (_step !== undefined && 0 < _step && _step < 1) {
      n = Math.round(1 / _step);
      step = 1 / n;
    }
    if (!n) {
      n = 25;
      step = 1 / 25;
    }
    let asName = [];
    if (_as) {
      asName = _as;
    }
    if (!asName[0]) {
      asName[0] = 'probability';
    }
    if (!asName[1]) {
      asName[1] = 'value';
    }
    let p_names = [];
    let quantile_rollups = {};
    let bumper = step / 2;
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
    let records = table.objects();
    let new_records = records.map((d) => {
      let o = {};
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