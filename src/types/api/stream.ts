import { ConfigInterface } from "./config";
import { DataObject, DatasetObject } from "./data";
import { ChannelObject } from "./channel";
import { SampledToneObject } from "./sampling";
import { TickObject } from "./tick";
import { TransformList } from "./transform";
import {
  SynthObject,
  ToneObject,
  WaveObject
} from "./tone";
import { Notify } from "classes/erie-notify";

export interface StreamObject {
  name?: string;
  title?: string;
  description?: string;
  data: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;
  skipTitle?: boolean,
  skipDescription?: boolean,

  tone: ToneObject;
  encoding: { [key: string]: ChannelObject },

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  notify?: { [key: string]: Notify };
  config?: ConfigInterface;
}

export interface OverlayObject {
  name?: string;
  title?: string;
  description?: string;
  data: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;
  skipTitle?: boolean;
  skipDescription?: boolean;
  skipLength?: boolean;

  overlay: StreamObject[];

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  notify?: { [key: string]: Notify };
  config?: ConfigInterface;
}

export type SequenceObject = {
  name?: string,
  title?: string,
  skipTitle?: boolean,
  description?: string,
  skipDescription?: boolean,
  skipLength?: boolean,

  data?: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;

  sequence: Array<OverlayObject | StreamObject>;

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  notify?: { [key: string]: Notify };
  config?: ConfigInterface;
}