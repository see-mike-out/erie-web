import { genRid } from "../util";
import { OrderSpec, OrderItem } from "../types/spec/order";

import {
  NormalizedOrderSpec,
  NormalizedOrderItem,
  NormalizedSpecifier,
} from "../types/spec/normalized";

function getSpecifierIds(
  item: OrderItem,
  sonificationSpec: any[]
): NormalizedSpecifier {
  const specifier: NormalizedSpecifier = {};

  if ("specifier" in item) {
    if (item.specifier.role) {
      specifier.role = item.specifier.role;
    }

    // Handle stream references
    if (item.specifier.stream) {
      const streamIndex = item.specifier.stream.index ?? 0;
      const overlayIndex = item.specifier.stream.overlay?.index;

      // Check if the streamIndex is valid
      if (
        streamIndex < sonificationSpec.length &&
        sonificationSpec[streamIndex]
      ) {
        if (
          overlayIndex !== undefined &&
          sonificationSpec[streamIndex].overlay
        ) {
          // Handle overlay reference
          specifier.streamId = sonificationSpec[streamIndex].id;
          specifier.overlayId =
            sonificationSpec[streamIndex].overlay[overlayIndex]?.id;
        } else {
          // Handle stream reference without overlay
          specifier.streamId = sonificationSpec[streamIndex].id;
        }
      }
    }

    // Preserve the channel if specified
    specifier.channel = item.specifier.channel;
  }

  return specifier;
}

export function normalizeOrderSpec(
  orderSpec: OrderSpec,
  sonificationSpec: any[]
): NormalizedOrderSpec {
  return {
    id: genRid(),
    ordering: orderSpec.ordering.map((item: OrderItem): NormalizedOrderItem => {
      const normalizedItem: NormalizedOrderItem = {
        id: genRid(),
        type: item.type,
      };

      if ("specifier" in item) {
        normalizedItem.specifier = getSpecifierIds(item, sonificationSpec);
      }

      if ("option" in item) {
        normalizedItem.options = item.option;
      }

      if (item.type === "text" && "text" in item) {
        normalizedItem.text = item.text;
      }

      return normalizedItem;
    }),
  };
}
