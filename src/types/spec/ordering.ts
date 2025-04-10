import { OrderingMarkup, OrderingRole, OrderingTypeMarkup, OrderingTypeSound, OrderingTypeText } from "../object";
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
};

// pure text
export type TextOrderItem = {
  text: string;
  // note
  description?: string;
};

// actual sonification
export type SoundOrderItem = {
  specifier: Specifier;
  notify?: NotifySpec;
  // note
  description?: string;
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
  channel?: string;
};