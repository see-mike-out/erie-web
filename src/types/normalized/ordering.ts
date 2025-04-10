import { OrderingMarkup, OrderingRole, OrderingTypeMarkup, OrderingTypeSound, OrderingTypeText } from "../object";
import { NotifySpec } from "../spec";

// Normalized types
export type OrderSpecNormed = OrderItemNormed[]; // Ordered sequence of items

export type OrderItemNormed = MarkupOrderItemNormed | TextOrderItemNormed | SoundOrderItemNormed;

// markup: text/scale description referring to the stream spec
export type MarkupOrderItemNormed = {
  type: typeof OrderingTypeMarkup;
  group_id: number;
  specifier: SpecifierNormed;
  markup?: OrderingMarkup;
  // note
  description?: string;
};

// pure text
export type TextOrderItemNormed = {
  type: typeof OrderingTypeText;
  group_id: number;
  text: string;
  // note
  description?: string;
};

// actual sonification
export type SoundOrderItemNormed = {
  type: typeof OrderingTypeSound;
  group_id: number;
  specifier: SpecifierNormed;
  notify?: NotifySpec;
  // note
  description?: string;
};

export type SpecifierNormed = {
  role: OrderingRole; // Role of the specifier
  streamId?: string; // Normalized ID assigned to the stream
  overlayId?: string; // Normalized ID for overlays
  channel?: string; // Optional reference to a channel
  is_repeated?: boolean;
};