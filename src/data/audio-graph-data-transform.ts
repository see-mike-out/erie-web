import { makeAscSortFn, makeDescSortFn, makeIndexSortFn } from "./audio-graph-data-sort"
import { createBin } from "./audio-graph-transform-bin";
import { doAggregate } from "./audio-graph-transform-aggregate";
import { makeBoxPlotTable } from "./audio-graph-transform-boxplot";
import { doCalculate } from "./audio-graph-transform-calculate";
import { filterTable } from "./audio-graph-transform-filter";
import { foldTable } from "./audio-graph-transform-fold";
import { generateQuantiles } from "./audio-graph-transform-quantile";
import { getKernelDensity } from "./audio-graph-transform-density";

import {
  AqTableType,
  Auto,
  DataOrderingItem,
  InternalData,
  RecordObject,
  TableInfoObject,
  TransformList
} from "../types";

import * as aq from "arquero";
const fromTidy = aq.from, op = aq.op, escape = aq.escape, aqTable = aq.table;

export function transformData(data: any[], transforms: TransformList, dimensions: string[]): InternalData {
  let table: AqTableType = fromTidy(data);
  let tableInfo: TableInfoObject = {};
  if (transforms?.constructor.name === "Array" && transforms.length > 0) {
    for (const transform of transforms) {
      // bin
      if ('bin' in transform && transform.bin) {
        let old_field_name = transform.bin;
        let new_field_name = transform.as || old_field_name + "__bin";
        if (table.column(new_field_name)) {
          // duplicate binning
          continue;
        }
        let new_field_name2 = transform.end || old_field_name + "__bin_end";
        if (!dimensions.includes(new_field_name)) dimensions.push(new_field_name);
        if (!dimensions.includes(new_field_name2)) dimensions.push(new_field_name2);
        // @ts-ignore
        let { start, end, nBuckets, equiBin } = createBin(table.column(old_field_name)?.data, transform);
        // the above line is correct, just Arquero does not make some types available.
        let binned = aqTable({ [new_field_name]: start, [new_field_name2]: end });
        table = table.assign(binned);
        // drop na
        table = table.filter(escape((d: RecordObject) => d[new_field_name] !== undefined && d[new_field_name2] !== undefined));
        if (!('bin' in tableInfo) || !tableInfo.bin) tableInfo.bin = {};
        tableInfo.bin[old_field_name] = { nBuckets, equiBin }
      }
      // aggregate
      else if ('aggregate' in transform && transform.aggregate) {
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
          } else if (typeof field === 'string') {
            tableInfo.aggregate[field] = { method, groupby };
          }
        }
      }
      // calculate
      else if ('calculate' in transform && transform.calculate) {
        let groupby = ('groupby' in transform) ? transform.groupby ?? [] : [];
        if (groupby === Auto) {
          groupby = dimensions;
        }
        table = doCalculate(table, transform, groupby);
      }
      // fold
      else if ('fold' in transform && transform.fold) {
        table = foldTable(table, transform.fold, transform.by, transform.exclude, transform.as);
      }
      // density
      else if ('density' in transform && transform.density) {
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
      else if ('filter' in transform && transform.filter) {
        table = filterTable(table, transform.filter);
      }
      // boxplot
      else if ('boxplot' in transform && transform.boxplot) {
        let groupby = ('groupby' in transform) ? transform.groupby ?? [] : [];
        if (groupby === Auto) {
          groupby = dimensions.filter((d) => table.columnNames().includes(d));
        }
        table = makeBoxPlotTable(table, transform.boxplot, transform.extent, transform.invalid, groupby);
      }
      // quantiles
      else if ('quantile' in transform && transform.quantile) {
        let groupby = ('groupby' in transform) ? transform.groupby ?? [] : [];
        if (groupby === Auto) {
          groupby = dimensions.filter((d) => table.columnNames().includes(d));
        }
        table = generateQuantiles(table, transform.quantile, transform.n, transform.step, groupby, transform.as);
      }
    }
  }
  let output: InternalData = new InternalData(table.objects());
  output.tableInfo = tableInfo;
  return output;
}

export function orderArray(data: InternalData, orders: DataOrderingItem[]) {
  let outcome, sortFunctions = [];
  for (const ord of orders) {
    let key = ord.key;
    if ('order' in ord && ord.order) {
      let sortFn = makeIndexSortFn(key, ord.order);
      sortFunctions.push(sortFn);
    } else if ('sort' in ord && (ord.sort === "ascending" || ord.sort === true || ord.sort === "asc")) {
      let sortFn = makeAscSortFn(key);
      sortFunctions.push(sortFn);
    } else if ('sort' in ord && (ord.sort === "descending" || ord.sort === "desc")) {
      let sortFn = makeDescSortFn(key);
      sortFunctions.push(sortFn);
    }
  }
  sortFunctions.reverse()
  if (sortFunctions.length > 0) {
    outcome = data.toSorted((a: RecordObject, b: RecordObject) => {
      for (const fn of sortFunctions) {
        if (fn(a, b) > 0) return 1;
        else if (fn(a, b) < 0) return - 1;
      }
      return 1;
    });
  }
  return outcome || data;
}
