import { extent } from "d3";
import * as vega from "vega-statistics";
import { AqTableType } from "../types";
import * as aq from "arquero";
const fromTidy = aq.from;

// this is from custom typing
const randomKDE = vega.randomKDE, sampleCurve = vega.sampleCurve;

// Manipulation of Vega to work with AQ;
export function getKernelDensity(
  table: AqTableType,
  field: string,
  groupby: string[] | undefined,
  cumulative: boolean | undefined,
  counts: boolean | undefined,
  _bandwidth: number | undefined,
  _extent: number[] | undefined,
  _minsteps: number | undefined,
  _maxsteps: number | undefined,
  steps: number | undefined,
  _as: [string, string] | undefined): AqTableType {
  let method: 'cdf' | 'pdf' = cumulative ? 'cdf' : 'pdf';
  let asName: [string, string] = _as ? [_as[0] ?? 'value', _as[1] ?? 'density'] : ['value', 'density'];
  let bandwidth = _bandwidth;
  let values: any[] = [];
  let domain = _extent;
  let minsteps = steps || _minsteps || 25;
  let maxsteps = steps || _maxsteps || 200;

  if (groupby && groupby?.length > 0) {
    let { groups, names } = aqPartition(table, groupby);
    groups.forEach((group, i) => {
      let g = group.array(field);
      const density = randomKDE(g, bandwidth)[method];
      const scale = counts ? g.length : 1;
      const local = domain || extent(g);
      let curve = sampleCurve(density, local, minsteps, maxsteps);
      curve.forEach((v: [number, number]) => {
        const t = {
          [asName[0]]: v[0],
          [asName[1]]: v[1] * scale,
        };
        if (groupby) {
          for (let j = 0; j < groupby.length; ++j) {
            t[groupby[j]] = names[i][j];
          }
        }
        values.push(t);
      });
    });
    return fromTidy(values).groupby(groupby);
  } else {
    let g = table.array(field);
    const density = randomKDE(g, bandwidth)[method];
    const scale = counts ? g.length : 1;
    const local = domain || extent(g);
    let curve = sampleCurve(density, local, minsteps, maxsteps);
    curve.forEach((v: [number, number]) => {
      const t = {
        [asName[0]]: v[0],
        [asName[1]]: v[1] * scale,
      };
      values.push(t);
    });
    return fromTidy(values);
  }
}

function aqPartition(table: AqTableType, groupby: string[]): {
  groups: AqTableType[], names: any[]
} {
  let grouped_table = table.groupby(groupby);
  let group_defs = grouped_table.groups();
  let n_parts = group_defs.size;
  let part_start = group_defs.rows;
  let part_end = part_start.slice(1, n_parts);
  part_end.push(table.numRows());
  let partitions = grouped_table.partitions();
  let tab_re = grouped_table.objects();
  let groups: AqTableType[] = [], names: any[] = [];
  partitions.forEach((p) => {
    let g = fromTidy(tab_re.filter((d, i) => p.includes(i)));
    groups.push(g);
    names.push(groupby.map((gb) => g.get(gb)));
  });
  return { groups, names };
}
