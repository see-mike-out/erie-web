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

export interface StreamObject {
  name?: string;
  title?: string;
  description?: string;
  data: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;

  tone: ToneObject;
  encoding: { [key: string]: ChannelObject },

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  config?: ConfigInterface;
}

export interface OverlayObject {
  name?: string;
  title?: string;
  description?: string;
  data: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;

  overlay: StreamObject[];

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  config?: ConfigInterface;
}

export interface SequenceObject {
  name?: string;
  title?: string;
  description?: string;
  data: DataObject;
  datasets?: DatasetObject[];
  transform?: TransformList;

  sequence: Array<OverlayObject | StreamObject>;

  sampling?: SampledToneObject[];
  synth?: SynthObject[];
  tick?: TickObject[];
  wave?: WaveObject[];

  config?: ConfigInterface;
}