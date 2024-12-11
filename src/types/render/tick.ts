import { OscType } from "../synth";

export type TickDefinition = {
  interval: number;
  band: number;
  playAtTime0?: boolean;
  pitch: number;
  oscType: OscType;
  loudness: number;
};
