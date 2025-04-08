import { ErieSynth } from "../../player";
import { HashedObject } from "../generic";
import { OscTypes } from "../object";
import { AudioFilterEncoder, AudioFilterFinisher, AudioFilterPrototype } from "./filter";
import { RamperCollection } from "./ramp";

export type InstrumentNode = OscillatorNode | AudioBufferSourceNode | ErieSynth;

export function isOscType(iType: any): iType is OscillatorType {
  return OscTypes.includes(iType)
}

export interface StreamerInstrument {
  inst: InstrumentNode,
  gain: GainNode,
  filterNodes: HashedObject<AudioFilterPrototype>,
  filterEncoders: HashedObject<AudioFilterEncoder>,
  filterFinishers: HashedObject<AudioFilterFinisher>,
  tick: InstrumentNode | (() => InstrumentNode) | null,
  panner: StereoPannerNode | PannerNode,
  isStereo: boolean,
  destination: AudioNode,
  rampers: RamperCollection
}