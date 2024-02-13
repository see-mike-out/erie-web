import { Auto } from "../compile/audio-graph-normalize";
import * as aq from "arquero";
// import { from as fromTidy, op, escape, table as aqTable } from "arquero";
import { bin, extent, group } from "d3";
import { randomKDE } from 'vega-statistics';
import { sampleCurve } from 'vega-statistics';
import { asc, desc } from "../util/audio-graph-util";

const fromTidy = aq.from, op = aq.op, escape = aq.escape, aqTable = aq.table;

export function transformData(data, transforms, dimensions) {
  let table = fromTidy(data);
  let tableInfo = {};
  if (transforms?.constructor.name === "Array" && transforms.length > 0) {
    for (const transform of transforms) {
      // bin
      if (transform.bin) {
        let old_field_name = transform.bin;
        let new_field_name = transform.as || old_field_name + "__bin";
        if (table.column(new_field_name)) {
          // duplicate binning
          continue;
        }
        let new_field_name2 = transform.end || old_field_name + "__bin_end";
        if (!dimensions.includes(new_field_name)) dimensions.push(new_field_name);
        if (!dimensions.includes(new_field_name2)) dimensions.push(new_field_name2);
        let { start, end, nBuckets, equiBin } = createBin(table.column(old_field_name).data, transform);
        let binned = aqTable({ [new_field_name]: start, [new_field_name2]: end });
        table = table.assign(binned);
        // drop na
        table = table.filter(escape(d => d[new_field_name] !== undefined && d[new_field_name2] !== undefined));
        if (!tableInfo.bin) tableInfo.bin = {};
        tableInfo.bin[old_field_name] = { nBuckets, equiBin }
      }
      // aggregate
      else if (transform.aggregate) {
        let aggregates = transform.aggregate;
        let groupby = transform.groupby || [];
        if (groupby === Auto) {
          groupby = dimensions.filter((d) => table.columnNames().includes(d));
        }
        table = doAggregate(table, aggregates, groupby);
        if (!tableInfo.aggregate) tableInfo.aggregate = {};
        for (const agg of aggregates) {
          let field = agg.field, method = agg.op;
          if (method === "count") {
            tableInfo.aggregate['__count'] = { method, groupby };
          } else {
            tableInfo.aggregate[field] = { method, groupby };
          }
        }
      }
      // calculate
      else if (transform.calculate) {
        // todo
        let groupby = transform.groupby || {};
        if (groupby === Auto) {
          groupby = dimensions;
        }
        table = doCalculate(table, transform, groupby);
      }
      // fold
      else if (transform.fold) {
        table = foldTable(table, transform.fold, transform.by, transform.exclude, transform.as);
      }
      // density
      else if (transform.density) {
        table = getKernelDensity(table,
          transform.density,
          transform.groupby,
          transform.cumulative,
          transform.counts,
          transform.bandwidth,
          transform.extent,
          transform.minsteps,
          transform.maxsteps,
          transform.steps,
          transform.as);
      }
      // filter
      else if (transform.filter) {
        table = filterTable(table, transform.filter);
      }
    }
  }
  let output = table.objects();
  output.tableInfo = tableInfo;
  return output;
}

function createBin(col, transform) {
  let is_nice = transform.nice;
  if (is_nice === undefined) is_nice = true;
  let maxbins = transform.maxbins || 10;
  let step = transform.step;
  let exact = transform.exact;
  let binFunction = bin(), buckets, binAssigner, equiBin;
  if (is_nice && maxbins && !step) {
    binFunction = binFunction.thresholds(maxbins);
    buckets = binFunction(col);
    equiBin = true;
  } else if (step) {
    maxbins = Math.ceil(extent(col) / step);
    binFunction = binFunction.thresholds(maxbins);
    buckets = binFunction(col);
    equiBin = true;
  } else if (exact) {
    binFunction = binFunction.thresholds(exact);
    buckets = binFunction(col);
    equiBin = false;
  }
  binAssigner = (d) => {
    let ib = buckets.map(b => (b.includes(d) ? { x0: b.x0, x1: b.x1 } : undefined)).filter(b => b != undefined)?.[0];
    return { start: ib?.x0, end: ib?.x1 };
  }
  let binned = col.map(binAssigner);
  let start = binned.map(d => d.start), end = binned.map(d => d.end);
  return { start, end, nBukcets: buckets.length, equiBin };
}

function doAggregate(table, aggregates, groupby) {
  let rollups = getRollUps(aggregates);
  return table.groupby(groupby).rollup(rollups);
}

function getRollUps(aggregates) {
  let rollups = {};
  for (const agg of aggregates) {
    let name_as = agg.as, field = agg.field, method = agg.op;
    if (method === "mean" || method === "average") {
      rollups[name_as] = `d => op.mean(d['${field}'])`;
    } else if (method === "valid") {
      rollups[name_as] = `d => op.valid(d['${field}'])`;
    } else if (method === "invalid") {
      rollups[name_as] = `d => op.invalid(d['${field}'])`;
    } else if (method === "max") {
      rollups[name_as] = `d => op.max(d['${field}'])`;
    } else if (method === "min") {
      rollups[name_as] = `d => op.min(d['${field}'])`;
    } else if (method === "distinct") {
      rollups[name_as] = `d => op.distinct(d['${field}'])`;
    } else if (method === "sum") {
      rollups[name_as] = `d => op.sum(d['${field}'])`;
    } else if (method === "product") {
      rollups[name_as] = `d => op.product(d['${field}'])`;
    } else if (method === "mode") {
      rollups[name_as] = `d => op.mode(d['${field}'])`;
    } else if (method === "median") {
      rollups[name_as] = `d => op.median(d['${field}'])`;
    } else if (method === "quantile") {
      let p = agg.p || 0.5;
      rollups[name_as] = `d => op.quantile(d['${field}'], ${p})`;
    } else if (method === "stdev") {
      rollups[name_as] = `d => op.stdev(d['${field}'])`;
    } else if (method === "stdevp") {
      rollups[name_as] = `d => op.stdevp(d['${field}'])`;
    } else if (method === "variance") {
      rollups[name_as] = `d => op.variance(d['${field}'])`;
    } else if (method === "variancep") {
      rollups[name_as] = `d => op.variancep(d['${field}'])`;
    } else if (method === "count") {
      rollups[name_as] = `d => op.count()`;
    } else if (method === "corr") {
      rollups[name_as] = `d => op.corr(d['${field[0]}'], d['${field[1]}'])`;
    } else if (method === "covariance") {
      rollups[name_as] = `d => op.covariance(d['${field[0]}'], d['${field[1]}'])`;
    } else if (method === "covariancep") {
      rollups[name_as] = `d => op.covariancep(d['${field[0]}'], d['${field[1]}'])`;
    }
  }
  return rollups;
}

function doCalculate(table, cal, groupby) {
  let eq = cal.calculate, name_as = cal.as;
  eq = eq.replace(/datum\./gi, 'd.');
  return table.groupby(groupby).derive({
    [name_as]: eq
  });
}

function foldTable(table, fold_fields, by, exclude, new_names) {
  let f = table.fold(fold_fields);
  if (exclude) {
    f = f.select(by, 'key', 'value');
  }
  if (new_names) {
    let key = new_names[0] || "key";
    let value = new_names[1] || "value";
    f = f.rename({ key, value });
  }
  return f;
}


export function orderArray(data, orders) {
  let outcome, sortFunctions = [];
  for (const ord of orders) {
    let key = ord.key, order = ord.order;
    if (ord.order) {
      let sortFn = makeIndexSortFn(key, order);
      sortFunctions.push(sortFn);
    } else if (ord.sort === "ascending" || ord.sort === true || ord.sort === "asc") {
      let sortFn = makeAscSortFn(key);
      sortFunctions.push(sortFn);
    } else if (ord.sort === "descending" || ord.sort === "desc") {
      let sortFn = makeDescSortFn(key);
      sortFunctions.push(sortFn);
    }
  }
  sortFunctions.reverse()
  if (sortFunctions.length > 0) {
    outcome = data.toSorted((a, b) => {
      for (const fn of sortFunctions) {
        if (fn(a, b) > 0) return 1;
        else if (fn(a, b) < 0) return - 1;
      }
      return 1;
    });
  }
  return outcome || data;
}

function makeIndexSortFn(key, order) {
  return (a, b) => {
    let det = order.indexOf(a[key]) - order.indexOf(b[key]);
    if (det != 0) return det;
    return 0;
  }
}

function makeAscSortFn(key) {
  return (a, b) => {
    return asc(a[key], b[key]);
  }
}


function makeDescSortFn(key) {
  return (a, b) => {
    return desc(a[key], b[key]);
  }
}

// Manipulation of Vega to work with AQ;
function getKernelDensity(table, field, groupby, cumulative, counts, _bandwidth, _extent, _minsteps, _maxsteps, steps, _as) {
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

function filterTable(table, filter) {
  return table.ungroup().filter(`d => ${filter.replace(/datum\./gi, 'd.')}`).reify();
}