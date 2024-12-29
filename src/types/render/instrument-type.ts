import { OscTypes } from "../synth";

export function isOscType(iType: any): iType is OscillatorType {
  return OscTypes.includes(iType)
}