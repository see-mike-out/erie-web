import { csvParse, tsvParse } from "d3";
import { isJSON, isCSV, isTSV } from "../util/audio-graph-typing-util";
import { deepcopy } from "../util/audio-graph-util";

export async function getDataWrap(dataDef, loaded_datasets, datasets) {
  let data;
  if (dataDef.values) {
    return deepcopy(dataDef.values);
  } else if (dataDef.name) {
    if (!loaded_datasets[dataDef.name]) {
      loaded_datasets[dataDef.name] = await getData(datasets[dataDef.name]);
    }
    data = deepcopy(loaded_datasets[dataDef.name]);
  } else {
    data = await getData(dataDef.name);
  }
  return data;
}

export async function getData(data_spec) {
  if (data_spec?.values) {
    return data_spec.values;
  } else if (data_spec?.csv) {
    return csvParse(data_spec?.csv);
  } else if (data_spec?.tsv) {
    return tsvParse(data_spec.tsv);
  } else if (data_spec?.url) {
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