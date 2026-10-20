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
      rollups[name_as] = `op.median('${field}')`;
    } else if (method === "valid" && typeof field === 'string') {
      rollups[name_as] = `op.valid('${field}')`;
    } else if (method === "invalid" && typeof field === 'string') {
      rollups[name_as] = `op.invalid('${field}')`;
    } else if (method === "max" && typeof field === 'string') {
      rollups[name_as] = `op.max('${field}')`;
    } else if (method === "min" && typeof field === 'string') {
      rollups[name_as] = `op.min('${field}')`;
    } else if (method === "distinct" && typeof field === 'string') {
      rollups[name_as] = `op.distinct('${field}')`;
    } else if (method === "sum" && typeof field === 'string') {
      rollups[name_as] = `op.sum('${field}')`;
    } else if (method === "product" && typeof field === 'string') {
      rollups[name_as] = `op.product('${field}')`;
    } else if (method === "mode" && typeof field === 'string') {
      rollups[name_as] = `op.mode('${field}')`;
    } else if (method === "median" && typeof field === 'string') {
      rollups[name_as] = `op.median('${field}')`;
    } else if (method === "quantile" && typeof field === 'string') {
      let p = agg.p ?? 0.5;
      rollups[name_as] = `op.quantile('${field}'], ${p})`;
    } else if (method === "stdev" && typeof field === 'string') {
      rollups[name_as] = `op.stdev('${field}')`;
    } else if (method === "stdevp" && typeof field === 'string') {
      rollups[name_as] = `op.stdevp('${field}')`;
    } else if (method === "variance" && typeof field === 'string') {
      rollups[name_as] = `op.variance('${field}')`;
    } else if (method === "variancep" && typeof field === 'string') {
      rollups[name_as] = `op.variancep('${field}')`;
    } else if (method === "count") {
      rollups[name_as] = `op.count()`;
    } else if (method === "corr" && field instanceof Array) {
      rollups[name_as] = `op.corr('${field[0]}'], '${field[1]}')`;
    } else if (method === "covariance" && field instanceof Array) {
      rollups[name_as] = `op.covariance('${field[0]}'], '${field[1]}')`;
    } else if (method === "covariancep" && field instanceof Array) {
      rollups[name_as] = `op.covariancep('${field[0]}'], '${field[1]}')`;
    }
  }
  return rollups;
}
