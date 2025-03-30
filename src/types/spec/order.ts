export type OrderSpec = {
  ordering: OrderItem[];
};

// union
export type OrderItem = MarkupOrderItem | TextOrderItem | SoundOrderItem;

// specifiers: query from to stream spec
export type Specifier = {
  role: (typeof OrderItemRoles)[number];
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

export const OrderItemRoles: string[] = [
  "stop-play-keyboard-shortcut",
  "cardinality",
  "stream.name",
  "stream.scale.overview",
  "stream.scale.description",
  "stream.overlay.length",
  "finished",
  "starting",
  "stream.sound",
];

// text/scale description referring to the stream spec
export const MarkupOrderType = "markup";
export type MarkupOrderItem = {
  type: typeof MarkupOrderType;
  description?: string;
  specifier: Specifier;
  option?: AnnouncementOption | ScaleDescriptionOption;
};

// Updated ScaleDescriptionOption to allow more flexibility for marked-up scale descriptions
export type ScaleDescriptionOption = {
  markup: string | string[]; // Can be a single string or an array of strings to handle multiple elements
  // Added types to handle audio elements for the description
  sound?: {
    value: string;
    duration?: number; // Duration in seconds or beats (default 0.5)
  };
  continuousAudio?: {
    v0: string; // Start value
    v1: string; // End value
    duration?: number; // Duration in seconds or beats
  };
  datumList?: {
    item: string;
    first?: number;
    last?: number;
    join?: string;
    and?: string;
  };
  // More properties can be added based on further needs for specific description formatting
};

export type AnnouncementOption = {
  numbering?: { markup: string } | boolean;
};

// pure text
export const TextOrderType = "text";
export type TextOrderItem = {
  type: typeof TextOrderType;
  description?: string;
  text: string;
};

// stream items
export const SoundOrderType = "sound";
export type SoundOrderItem = {
  type: typeof SoundOrderType;
  description?: string;
  specifier: Specifier;
  option?: SoundOption;
};

export type SoundOption = {
  indicateStart?: SoundIndicatorChime | SoundIndicatorText | boolean;
  indicateEnd?: SoundIndicatorChime | SoundIndicatorText | boolean;
};

export type SoundIndicatorChime = {
  type?: string; // instrument
  pitch?: number; // default 660
  detune?: number; // default 0
  loudness?: number; // default 1
  pan?: number; // default 0
  duration?: number; // default 0.5
  attack?: number; // default 0.15
  decay?: number; // default 0.1
  sustain?: number; // default 0.8
  release?: number; // 0
};

export type SoundIndicatorText = {
  pitch?: number;
  loudness?: number;
  text: string;
};