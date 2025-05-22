import {
  bcp47language,
  OrderingMarkup,
  OrderingRole
} from "../object";
import { NotifySpec } from "./notify";

export type OrderSpec = OrderItem[];

// union
export type OrderItem = MarkupOrderItem | TextOrderItem | SoundOrderItem;

// markup: text/scale description referring to the stream spec
export type MarkupOrderItem = {
  specifier: Specifier;
  markup?: OrderingMarkup;
  // note
  description?: string;
  speechOption?: SpeechOption;
};

// pure text
export type TextOrderItem = {
  text: string;
  // note
  description?: string;
  speechOption?: SpeechOption;
};

// actual sonification
export type SoundOrderItem = {
  specifier: Specifier;
  notify?: NotifySpec;
  // note
  description?: string;
  speechOption?: SpeechOption;
};

// specifiers: query from to stream spec
export type Specifier = {
  role: OrderingRole;
  stream?: {
    index?: number;
    name?: string;
    overlay?: {
      index?: number;
      name?: string;
    };
  };
  is_repeated?: boolean;
  channel?: string;
};

export type SpeechOption = {
  language: typeof bcp47language[number];
  pitch: number;
  loudness: number;
  speechRate: number;
}