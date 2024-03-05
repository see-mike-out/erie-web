import * as aq from "arquero";
const fromTidy = aq.from;

export function makeBoxPlotTable(_table, field, _extent, _invalid, groupby) {
  if (field) {
    let extent = _extent, invalid = _invalid;
    if (extent === undefined) extent = 1.5;
    if (invalid === undefined) invalid = 'filter';
    let table = _table.reify();
    // 1. get basic stats: min, max, 1Q, median, 3Q;
    if (invalid === 'filter') {
      table = table.filter(`d => !op.is_nan(d['${field}'])`);
    } else {
      table = table.impute({ [field]: () => 0 });
    }
    if (groupby && groupby.length > 0) {
      table = table.groupby(...groupby)
    }
    if (extent === "min-max") {
      let rollup1 = { // median, q1, q3
        median: `d => op.median(d['${field}'])`,
        q1: `d => op.quantile(d['${field}'], 0.25)`,
        q3: `d => op.quantile(d['${field}'], 0.75)`,
        whisker_lower: `d => op.min(d['${field}'])`,
        whisker_upper: `d => op.max(d['${field}'])`
      }, rollup8 = { // get outliers
        outlier_lower: `d => d['${field}'] < d.whisker_lower ? d['${field}'] : null`,
        outlier_upper: `d => d['${field}'] > d.whisker_upper ? d['${field}'] : null`,
        outlier: `d => (d['${field}'] < d.whisker_lower || d['${field}'] > d.whisker_upper) ? d['${field}'] : null`
      };

      // operate the values
      table = table.derive(rollup1)
        .derive(rollup8)
        .select(...groupby, field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');

    } else if (typeof extent == 'number') {
      let rollup1 = { // median, q1, q3
        median: `d => op.median(d['${field}'])`,
        q1: `d => op.quantile(d['${field}'], 0.25)`,
        q3: `d => op.quantile(d['${field}'], 0.75)`
      }, rollup2 = { // whisker boundary
        whisker_lower_boundary: `d => d.q1 - op.abs(d.q3 - d.q1) * ${extent}`,
        whisker_upper_boundary: `d => d.q3 + op.abs(d.q3 - d.q1) * ${extent}`
      }, rollup3 = { // whisker operation 1
        whisker_lower_diff: `d => d['${field}'] > d.whisker_lower_boundary ? op.abs(d['${field}'] - d.whisker_lower_boundary) : op.abs(op.max(d['${field}']))`,
        whisker_upper_diff: `d => d['${field}'] < d.whisker_upper_boundary ? op.abs(d.whisker_upper_boundary - d['${field}']) : op.abs(op.max(d['${field}']))`
      }, rollup4 = { // whisker operation 2
        whisker_lower_value_check: `d => op.min(d.whisker_lower_diff)`,
        whisker_upper_value_check: `d => op.min(d.whisker_upper_diff)`
      }, rollup5 = { // whisker value marking
        is_whisker_lower: `d => d.whisker_lower_value_check == d.whisker_lower_diff`,
        is_whisker_upper: `d => d.whisker_upper_value_check == d.whisker_upper_diff`
      }, rollup6 = { // get whisker value 1
        whisker_lower_propa: `d => d.is_whisker_lower ? d['${field}'] : - Math.Infinity`,
        whisker_upper_propa: `d => d.is_whisker_upper ? d['${field}'] : Math.Infinity`
      }, rollup7 = { // get whisker value (propagation to all the fields)
        whisker_lower: `d => op.max(d.whisker_lower_propa)`,
        whisker_upper: `d => op.min(d.whisker_upper_propa)`
      }, rollup8 = { // get outliers
        outlier_lower: `d => d['${field}'] < d.whisker_lower ? d['${field}'] : null`,
        outlier_upper: `d => d['${field}'] > d.whisker_upper ? d['${field}'] : null`,
        outlier: `d => (d['${field}'] < d.whisker_lower || d['${field}'] > d.whisker_upper) ? d['${field}'] : null`
      };

      // operate the values
      table = table.derive(rollup1)
        .derive(rollup2)
        .derive(rollup3)
        .derive(rollup4)
        .derive(rollup5)
        .derive(rollup6)
        .derive(rollup7)
        .derive(rollup8)
        .select(...groupby, field, 'median', 'q1', 'q3', 'whisker_lower', 'whisker_upper', 'outlier_lower', 'outlier_upper', 'outlier');
    }
    // clear the output - statistics
    let output_columns = ['whisker_lower', 'q1', 'median', 'q3', 'whisker_upper'];
    let rollup_clear = {};
    output_columns.forEach((c) => {
      if (!c.startsWith('outlier')) {
        rollup_clear[c] = `d => op.mean(d['${c}'])`
      }
    });
    let role_assigner = `(d) => 'point'`;
    let order_assigner = `(d) => op.indexof(${JSON.stringify(output_columns)}, d.key)`;
    let group_name_assigner = `(d) => ${groupby.map(k => `d['${k}']`).join(` + '_' + `)}`;
    let table_stats = table
      .rollup(rollup_clear)
      .fold([...output_columns])
      .derive({ role: role_assigner, order: order_assigner, group_name: group_name_assigner });
    let records_stats = table_stats.objects();

    // clear the output - outliers
    let rank_assigner = `(d) => op.rank()`;
    let table_outliers = table.filter(d => d.outlier != null)
      .orderby('outlier')
      .derive({ rank: rank_assigner, group_name: group_name_assigner });
    let records_outliers = table_outliers.objects();
    let outlier_counter_lower = {}, outlier_counter_upper = {};
    for (const outlier of records_outliers) {
      let o = {};
      for (const gkey of groupby) {
        o[gkey] = outlier[gkey];
      }
      o.key = 'outlier';
      o.group_name = outlier.group_name;
      o.role = 'outlier'
      o.value = outlier.outlier;
      if (outlier.outlier_lower) {
        if (outlier_counter_lower[outlier.group_name] === undefined) outlier_counter_lower[outlier.group_name] = 0;
        outlier_counter_lower[outlier.group_name] += 1;
        o.order = - outlier_counter_lower[outlier.group_name];
      }
      if (outlier.outlier_upper) {
        if (outlier_counter_upper[outlier.group_name] === undefined) outlier_counter_upper[outlier.group_name] = 0;
        outlier_counter_upper[outlier.group_name] += 1;
        o.order = output_columns.length + outlier_counter_upper[outlier.group_name];
      };
      records_stats.push(o)
    }

    // match the data type
    table = fromTidy(records_stats).orderby([...groupby, 'order']).groupby(groupby);

    return table.reify();
  } else {
    console.warn("No field was provided for the box plot.")
    return _table;
  }
}