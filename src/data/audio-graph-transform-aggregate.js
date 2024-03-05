export function doAggregate(table, aggregates, groupby) {
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
