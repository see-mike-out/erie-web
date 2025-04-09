import { OrderingRole, OrderingTypeMarkup, OrderingTypeSound, OrderingTypeText } from "../object";
import { NotifySpec } from "./notify";

export type OrderSpec = OrderItem[];

// union
export type OrderItem = MarkupOrderItem | TextOrderItem | SoundOrderItem;

// markup: text/scale description referring to the stream spec
export type MarkupOrderItem = {
  type: typeof OrderingTypeMarkup;
  specifier: Specifier;
  option?: AnnouncementOption | ScaleDescriptionOption;

  // note
  description?: string;
};

// pure text
export type TextOrderItem = {
  type: typeof OrderingTypeText;
  text: string;

  // note
  description?: string;
};

// actual sonification
export type SoundOrderItem = {
  type: typeof OrderingTypeSound;
  specifier: Specifier;
  option?: SoundOption;
  
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

// Updated ScaleDescriptionOption to allow more flexibility for marked-up scale descriptions
export type ScaleDescriptionOption = {
  markup: string | string[]; // Can be a single string or an array of strings to handle multiple elements
};

export type AnnouncementOption = {
  numbering?: { markup: string } | boolean;
};

export type SoundOption = {
  notify?: NotifySpec
};