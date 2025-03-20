// Normalized types
export type NormalizedOrderSpec = {
  id: string; // Unique identifier assigned to this order spec
  ordering: NormalizedOrderItem[]; // Ordered sequence of items
};

export type NormalizedOrderItem = {
  id: string; // Unique ID for referencing this item, incrementally assigned
  type: OrderItemType;
  specifier?: NormalizedSpecifier; // Reference to the stream or overlay
  options?: any; // Additional metadata or configuration
  text?: string; // Add this line to include the text property
};

export type OrderItemType =
  | "markup"
  | "text"
  | "sound"
  | "stop-play-keyboard-shortcut"
  | "stream.name"
  | "stream.scale.overview"
  | "stream.scale.description"
  | "stream.overlay.length"
  | "finished"
  | "starting"
  | "stream.sound";

export type NormalizedSpecifier = {
  streamId?: string; // Normalized ID assigned to the stream
  overlayId?: string; // Normalized ID for overlays
  channel?: string; // Optional reference to a channel
  role?: string; // Role of the specifier
};
