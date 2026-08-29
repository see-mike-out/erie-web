import { expect, test } from 'vitest';
import * as aq from "arquero";
const fromTidy = aq.from;
import { makeBoxPlotTable } from "../src/data/audio-graph-transform-boxplot";
import { Datum } from '../src/types';

test("Boxplot", async () => {
  let table = fromTidy([
    { "category": "A", "value": 0 },
    { "category": "A", "value": 2 },
    { "category": "A", "value": 4 },
    { "category": "A", "value": 6 },
    { "category": "A", "value": 9 },
    { "category": "A", "value": 10 },
    { "category": "A", "value": 66 },
    { "category": "B", "value": 1 },
    { "category": "B", "value": 3 },
    { "category": "B", "value": 5 },
    { "category": "B", "value": 7 },
    { "category": "B", "value": 10 },
    { "category": "B", "value": 11 },
    { "category": "B", "value": 99 },
  ]);
  let box_table = makeBoxPlotTable(table, "value", 1.5, 'filter', ['category']);
  let table_objects = box_table.objects() as Datum[];
  expect(table_objects.length).toBe(12);
  let A = table_objects.filter((d) => d.category == 'A'), B = table_objects.filter((d) => d.category == 'B')
  expect(A.length).toBe(6);
  expect(A.map((d) => d.key)).toStrictEqual(['whisker_lower', 'q1', 'median', 'q3', 'whisker_upper', 'outlier']);
  expect(A.map((d) => d.role)).toStrictEqual(['point', 'point', 'point', 'point', 'point', 'outlier']);
  expect(A[A.length - 1].value).toStrictEqual(66);
  expect(B.map((d) => d.key)).toStrictEqual(['whisker_lower', 'q1', 'median', 'q3', 'whisker_upper', 'outlier']);
  expect(B.map((d) => d.role)).toStrictEqual(['point', 'point', 'point', 'point', 'point', 'outlier']);
  expect(B[B.length - 1].value).toStrictEqual(99);
});
