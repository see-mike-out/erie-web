import { ErieSynth } from "../../player";
import { OscTypes } from "../object";

export type InstrumentNode = OscillatorNode | AudioBufferSourceNode | ErieSynth;

export function isOscType(iType: any): iType is OscillatorType {
  return OscTypes.includes(iType)
}