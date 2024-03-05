import { extent } from "d3";
import { randomKDE } from 'vega';
import { sampleCurve } from 'vega';
import * as aq from "arquero";
const fromTidy = aq.from;

// Manipulation of Vega to work with AQ;
export function getKernelDensity(table, field, groupby, cumulative, counts, _bandwidth, _extent, _minsteps, _maxsteps, steps, _as) {
  let method = cumulative ? 'cdf' : 'pdf';
  _as = _as || ['value', 'density'];
  let bandwidth = _bandwidth;
  let values = [];
  let domain = _extent;
  let minsteps = steps || _minsteps || 25;
  let maxsteps = steps || _maxsteps || 200;

  if (groupby || groupby?.length > 0) {
    let { groups, names } = aqPartition(table, groupby);
    groups.forEach((group, i) => {
      let g = group.array(field);
      const density = randomKDE(g, bandwidth)[method];
      const scale = counts ? g.length : 1;
      const local = domain || extent(g);
      let curve = sampleCurve(density, local, minsteps, maxsteps);
      curve.forEach(v => {
        const t = {
          [_as[0]]: v[0],
          [_as[1]]: v[1] * scale,
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
    curve.forEach(v => {
      const t = {
        [_as[0]]: v[0],
        [_as[1]]: v[1] * scale,
      };
      if (groupby) {
        for (let j = 0; j < groupby.length; ++j) {
          t[groupby[j]] = names[i][j];
        }
      }
      values.push(t);
    });
    return fromTidy(values);
  }
}

function aqPartition(table, groupby) {
  let grouped_table = table.groupby(groupby);
  let group_defs = grouped_table.groups();
  let n_parts = group_defs.size;
  let part_start = group_defs.rows;
  let part_end = part_start.slice(1, n_parts);
  part_end.push(table.numRows());
  let partitions = grouped_table.partitions();
  let tab_re = grouped_table.objects();
  let groups = [], names = [];
  partitions.forEach((p) => {
    let g = fromTidy(tab_re.filter((d, i) => p.includes(i)));
    groups.push(g);
    names.push(groupby.map(gb => g.get(gb)));
  });
  return { groups, names };
}
