import {
  AggregateItem,
  AqTableType,
  RecordObject
} from "../types";

export function doAggregate(table: AqTableType, aggregates: AggregateItem[], groupby: string[]) {
  let rollups = getRollUps(aggregates);
  return table.groupby(groupby).rollup(rollups);
}

function getRollUps(aggregates: AggregateItem[]): RecordObject {
  let rollups: RecordObject = {};
  for (const agg of aggregates) {
    let name_as = agg.as, field = agg.field, method = agg.op;
    if ((method === "mean" || method === "average") && typeof field === 'string') {
      rollups[name_as] = `d => op.mean(d['${field}'])`;
    } else if (method === "valid" && typeof field === 'string') {
      rollups[name_as] = `d => op.valid(d['${field}'])`;
    } else if (method === "invalid" && typeof field === 'string') {
      rollups[name_as] = `d => op.invalid(d['${field}'])`;
    } else if (method === "max" && typeof field === 'string') {
      rollups[name_as] = `d => op.max(d['${field}'])`;
    } else if (method === "min" && typeof field === 'string') {
      rollups[name_as] = `d => op.min(d['${field}'])`;
    } else if (method === "distinct" && typeof field === 'string') {
      rollups[name_as] = `d => op.distinct(d['${field}'])`;
    } else if (method === "sum" && typeof field === 'string') {
      rollups[name_as] = `d => op.sum(d['${field}'])`;
    } else if (method === "product" && typeof field === 'string') {
      rollups[name_as] = `d => op.product(d['${field}'])`;
    } else if (method === "mode" && typeof field === 'string') {
      rollups[name_as] = `d => op.mode(d['${field}'])`;
    } else if (method === "median" && typeof field === 'string') {
      rollups[name_as] = `d => op.median(d['${field}'])`;
    } else if (method === "quantile" && typeof field === 'string') {
      let p = agg.p || 0.5;
      rollups[name_as] = `d => op.quantile(d['${field}'], ${p})`;
    } else if (method === "stdev" && typeof field === 'string') {
      rollups[name_as] = `d => op.stdev(d['${field}'])`;
    } else if (method === "stdevp" && typeof field === 'string') {
      rollups[name_as] = `d => op.stdevp(d['${field}'])`;
    } else if (method === "variance" && typeof field === 'string') {
      rollups[name_as] = `d => op.variance(d['${field}'])`;
    } else if (method === "variancep" && typeof field === 'string') {
      rollups[name_as] = `d => op.variancep(d['${field}'])`;
    } else if (method === "count") {
      rollups[name_as] = `d => op.count()`;
    } else if (method === "corr" && field instanceof Array) {
      rollups[name_as] = `d => op.corr(d['${field[0]}'], d['${field[1]}'])`;
    } else if (method === "covariance" && field instanceof Array) {
      rollups[name_as] = `d => op.covariance(d['${field[0]}'], d['${field[1]}'])`;
    } else if (method === "covariancep" && field instanceof Array) {
      rollups[name_as] = `d => op.covariancep(d['${field[0]}'], d['${field[1]}'])`;
    }
  }
  return rollups;
}
