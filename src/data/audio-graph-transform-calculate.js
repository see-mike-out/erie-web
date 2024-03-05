export function doCalculate(table, cal, groupby) {
  let eq = cal.calculate, name_as = cal.as;
  eq = eq.replace(/datum\./gi, 'd.');
  return table.groupby(groupby).derive({
    [name_as]: eq
  });
}