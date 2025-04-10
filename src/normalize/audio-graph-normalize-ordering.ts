import { genRid } from "../util";
import {
  OrderSpec,
  OrderItem,
  NormalizedStreamItem,
  OrderingTypeText,
  TextOrderItemNormed,
  OrderingTypeMarkup,
  MarkupOrderItemNormed,
  OrderSpecNormed,
  SpecifierNormed,
  Specifier,
  NormalizedSingleStream,
  OrderingTypeSound,
  SoundOrderItemNormed,
  ConfigInterface,
} from "../types";


export function normalizeOrderSpec(
  orderSpec: OrderSpec,
  sonificationSpec: NormalizedStreamItem[]
): OrderSpecNormed {
  let output: OrderSpecNormed = [];
  let group_index = 0;
  for (const item of orderSpec) {
    if ('text' in item && item.text !== undefined) {
      let normed: TextOrderItemNormed = {
        type: OrderingTypeText,
        group_id: group_index,
        description: item.description,
        text: item.text
      }
      output.push(normed);
    } else if ('specifier' in item) {
      let normedSpecifier = normalizeSpecifier(item.specifier, sonificationSpec);
      if (normedSpecifier.role === 'sound') {
        let normed: SoundOrderItemNormed = {
          type: OrderingTypeSound,
          group_id: group_index,
          description: item.description,
          specifier: normedSpecifier
        }
        if ('notify' in item) {
          normed.notify = item.notify;
        }
        output.push(normed);
      } else {
        let normed: MarkupOrderItemNormed = {
          type: OrderingTypeMarkup,
          group_id: group_index,
          description: item.description,
          specifier: normedSpecifier
        }
        if ('markup' in item) {
          normed.markup = item.markup;
        }
        output.push(normed);
      }
    }
    group_index++;
  }
  return output;
}


function normalizeSpecifier(
  specifer: Specifier,
  sonificationSpec: NormalizedStreamItem[]
): SpecifierNormed {
  let hasIntroSeq = 'intro' in sonificationSpec[0];
  let normed: SpecifierNormed = {
    role: specifer.role,
  };
  if (specifer.channel) {
    normed.channel = specifer.channel;
  }
  if (specifer.stream) {
    let streamId!: string, selectedStream!: NormalizedStreamItem;
    if (specifer.stream.name) {
      let name = specifer.stream.name;
      selectedStream = sonificationSpec.filter((s) => 'name' in s && s.name && (s.name === name))?.[0]
      streamId = selectedStream.id;
    }
    if (!streamId && specifer.stream.index !== undefined) {
      selectedStream = sonificationSpec[specifer.stream.index + (hasIntroSeq ? 1 : 0)]
      streamId = selectedStream.id;
    }
    normed.streamId = streamId;
    if ('stream' in selectedStream && selectedStream.stream.encoding.repeat) {
      normed.is_repeated = true;
    }
    if (specifer.stream.overlay && selectedStream && 'overlay' in selectedStream) {
      let overlayId!: string;
      let selectedOverlay!: NormalizedSingleStream;
      if (specifer.stream.overlay.name) {
        let name = specifer.stream.overlay.name;
        selectedOverlay = selectedStream.overlay.filter((s) => 'name' in s && s.name && (s.name === name))?.[0]
        overlayId = selectedOverlay.id;
      }
      if (!overlayId && specifer.stream.overlay.index !== undefined) {
        selectedOverlay = selectedStream.overlay[0];
        overlayId = selectedOverlay.id;
      }
      normed.overlayId = overlayId;
    }
  }
  return normed;
}