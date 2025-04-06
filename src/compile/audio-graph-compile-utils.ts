import { Datum, EncodingType, ORD, QUANT } from "../types";

export function detectType(values: Datum[]): EncodingType {
  if (values.every((d) => d?.constructor.name === "Number")) return QUANT;
  else return ORD;
}
