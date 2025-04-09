import { OrderingRole, OrderingTypeMarkup, OrderingTypeSound, OrderingTypeText } from "../object";
import { AnnouncementOption, ScaleDescriptionOption, SoundOption } from "../spec";

// Normalized types
export type OrderSpecNormed = {
  ordering: OrderItemNormed[]; // Ordered sequence of items
};

export type OrderItemNormed = MarkupItemNormed | TextOrderItem | SoundOrderItem;

// markup: text/scale description referring to the stream spec
export type MarkupItemNormed = {
  type: typeof OrderingTypeMarkup;
  specifier: SpecifierNormed;
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
  specifier: SpecifierNormed;
  option?: SoundOption;

  // note
  description?: string;
};

export type SpecifierNormed = {
  role?: OrderingRole; // Role of the specifier
  streamId?: string; // Normalized ID assigned to the stream
  overlayId?: string; // Normalized ID for overlays
  channel?: string; // Optional reference to a channel
};