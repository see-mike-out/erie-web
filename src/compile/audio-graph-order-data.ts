import { DataOrderingItem, EncodingNormed, InternalData, REPEAT_chn, TIME_chn } from "../types";
import { asc, unique } from "../util";

export function orderData(
  encoding: EncodingNormed,
  data: InternalData,
  repeat_options?: {
    is_repeated: boolean,
    repeat_field?: string[]
  }) {
  let data_order: DataOrderingItem[] = [];
  if (TIME_chn in encoding && encoding[TIME_chn].field && encoding[TIME_chn].scale?.order) {
    data_order.push({
      key: encoding[TIME_chn].field as string, order: [encoding[TIME_chn].scale?.order]
    });
  } else if (TIME_chn in encoding && encoding[TIME_chn].field && 'sort' in (encoding[TIME_chn]?.scale ?? {}) && encoding[TIME_chn].scale?.sort) {
    data_order.push({
      key: encoding[TIME_chn].field as string, sort: encoding[TIME_chn].scale?.sort
    });
  } else if (TIME_chn in encoding && encoding[TIME_chn].field && 'domain' in (encoding[TIME_chn]?.scale ?? {}) && encoding[TIME_chn].scale?.domain) {
    data_order.push({
      key: encoding[TIME_chn].field as string, order: encoding[TIME_chn].scale?.domain
    });
  } else if (TIME_chn in encoding && encoding[TIME_chn].field) {
    let f = encoding[TIME_chn].field as string
    data_order.push({
      key: f, order: unique(data.map(d => d[f])).toSorted(asc)
    });
  }


  let is_repeated = repeat_options?.is_repeated,
    repeat_field = repeat_options?.repeat_field;

  if (is_repeated && repeat_field && repeat_field.length == 1 && encoding[REPEAT_chn].scale?.order) {
    data_order.push({
      key: repeat_field[0], order: encoding[REPEAT_chn].scale?.order
    });
  } else if (is_repeated && repeat_field && repeat_field.length == 1 && encoding[REPEAT_chn].scale?.sort) {
    data_order.push({
      key: repeat_field[0], sort: encoding[REPEAT_chn].scale?.sort
    });
  } else if (is_repeated && (repeat_field instanceof Array)) {
    repeat_field.toReversed().forEach((key) => {
      let order = unique(data.map(d => d[key])).toSorted(asc);
      data_order.push({
        key, order
      });
    });
  }
  return data_order;
}