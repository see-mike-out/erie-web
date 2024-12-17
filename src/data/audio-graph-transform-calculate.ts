import {
  AqTableType,
  CalculateObject
} from "../types";

export function doCalculate(table: AqTableType, cal: CalculateObject, groupby: string[]): AqTableType {
  let eq = cal.calculate, name_as = cal.as;
  eq = eq.replace(/datum\./gi, 'd.');
  return table.groupby(groupby).derive({
    [name_as]: eq
  });
}