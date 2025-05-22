import {
  DatasetSpecItem,
  DataSpec
} from "../types";
import { deepcopy } from "../util";

export function addURLtoDataObject<T extends DataSpec | DatasetSpecItem>(data: T, dataBaseUrl: string | undefined): T {
  let d = deepcopy(data);
  if (dataBaseUrl && 'url' in d && d.url) {
    let n = URL.parse(d.url, dataBaseUrl);
    if (n) d.url = n.href as string;
  }
  return d;
}
