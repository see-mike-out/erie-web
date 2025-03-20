import { SequenceStream } from "../compile";
import { genRid } from "../util";
import { OrderSpec, OrderItem } from "../types/spec/order";

import {
  NormalizedOrderSpec,
  NormalizedOrderItem,
  NormalizedSpecifier,
  OrderItemType,
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
    if (item.specifier.stream) {
      const streamIndex = item.specifier.stream.index;
      const overlayIndex = item.specifier.stream.overlay?.index;

      if (sonificationSpec[0]) {
        if (overlayIndex !== undefined && sonificationSpec[0].overlay) {
          specifier.streamId = sonificationSpec[0].id;
          specifier.overlayId = sonificationSpec[0].overlay[overlayIndex].id;
        } else {
          specifier.streamId = sonificationSpec[0].id;
        }
      }
    }
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
