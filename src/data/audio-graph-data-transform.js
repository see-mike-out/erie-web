import { Auto } from "../compile/audio-graph-normalize";
import * as aq from "arquero";
import { filterTable } from "./audio-graph-transform-filter";
import { makeAscSortFn, makeDescSortFn, makeIndexSortFn } from "./audio-graph-data-sort";
import { getKernelDensity } from "./audio-graph-transform-density";
import { foldTable } from "./audio-graph-transform-fold";
import { doCalculate } from "./audio-graph-transform-calculate";
import { doAggregate } from "./audio-graph-transform-aggregate";
import { createBin } from "./audio-graph-transform-bin";
import { makeBoxPlotTable } from "./audio-graph-transform-boxplot";
import { generateQuantiles } from "./audio-graph-transform-quantile";


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
      // boxplot
      else if (transform.boxplot) {
        let groupby = transform.groupby || [];
        if (groupby === Auto) {
          groupby = dimensions.filter((d) => table.columnNames().includes(d));
        }
        table = makeBoxPlotTable(table, transform.boxplot, transform.extent, transform.invalid, groupby);
      }
      // quantiles
      else if (transform.quantile) {
        let groupby = transform.groupby || [];
        if (groupby === Auto) {
          groupby = dimensions.filter((d) => table.columnNames().includes(d));
        }
        table = generateQuantiles(table, transform.quantile, transform.n, transform.step, groupby, transform.as);
      }
    }
  }
  let output = table.objects();
  output.tableInfo = tableInfo;
  return output;
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
