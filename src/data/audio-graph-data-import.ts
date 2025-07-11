import {
  csvParse,
  tsvParse
} from "d3";
import {
  isJSON,
  isCSV,
  isTSV,
  deepcopy
} from "../util";
import {
  DataSpec,
  DatasetSpecItemNormed,
  LoadedDatasets
} from "../types";

export async function getData(
  dataDef: DataSpec,
  loaded_datasets: LoadedDatasets,
  datasets: { [key: string]: DatasetSpecItemNormed }
) {
  let data;
  if ('values' in dataDef && dataDef.values) {
    return deepcopy(dataDef.values);
  } else if ('name' in dataDef && dataDef.name) {
    if (!loaded_datasets[dataDef.name]) {
      loaded_datasets[dataDef.name] = await _getData(datasets[dataDef.name]);
    }
    data = deepcopy(loaded_datasets[dataDef.name]);
  } else {
    data = await _getData(dataDef);
  }
  return data;
}

export async function _getData(data_spec: DataSpec) {
  if (data_spec && 'values' in data_spec && data_spec?.values) {
    return data_spec.values;
  } else if (data_spec && 'url' in data_spec && data_spec?.url) {
    let read = await (await fetch(data_spec.url)).text();
    if (isJSON(read)) {
      return JSON.parse(read);
    } else if (isCSV(read)) {
      return csvParse(read);
    } else if (isTSV(read)) {
      return tsvParse(read);
    }
  } else {
    console.error("wrong data format provided");
    return []
  }
}
// not understanding this
// else if (data_spec?.data?.values) {
//   return data_spec.data.values;
// } else if (data_spec?.csv) {
//   return csvParse(data_spec?.csv);
// } else if (data_spec?.tsv) {
//   return tsvParse(data_spec.tsv);
// }