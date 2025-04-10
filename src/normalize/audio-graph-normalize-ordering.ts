import { deepcopy, genRid } from "../util";
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
  RoleRepeatTitle,
  RecordObject,
  RoleStreamSound,
  RepeatOrderItemNormed,
  OrderingTypeRepeat,
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
      let { normedSpecifier, specified } = normalizeSpecifier(item.specifier, sonificationSpec);
      if (normedSpecifier.role === 'sound') {
        if (normedSpecifier.is_repeated) {
          let prev = output[output.length - 1];
          if (!(prev &&
            prev.type === OrderingTypeMarkup
            && 'specifier' in prev
            && prev.specifier.role === RoleRepeatTitle
            && matchSpecifiedStream(prev.specifier, normedSpecifier)
          )) {
            // add a scale description
            if ('stream' in specified.stream && !specified.stream.stream?.encoding?.repeat?.skipDescription) {
              let titleSpecifier = deepcopy(normedSpecifier);
              titleSpecifier.role = RoleRepeatTitle;
              let repeatTitleNormed: MarkupOrderItemNormed = {
                type: OrderingTypeMarkup,
                group_id: group_index,
                description: "Repeat title (added)",
                specifier: titleSpecifier
              }
              output.push(repeatTitleNormed);
              group_index++;
            }
          }
        }
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
  // check repeats
  let repeat_groups: Array<number[]> = [];
  let marker!: MarkupOrderItemNormed | SoundOrderItemNormed | undefined, curr_group: number[] = [];
  for (let i = 0; i < output.length; i++) {
    let orderItem = output[i];
    if ('specifier' in orderItem && orderItem.specifier.is_repeated) {
      // if the item is repeated
      if (marker === undefined) {
        // when the mark is not set, it's the first of its group;
        marker = orderItem;
        curr_group.push(i)
      } else {
        // when the mark is set already:
        if (matchSpecifiedStream(marker.specifier, orderItem.specifier)) {
          // if it's in the same group, then add it.
          curr_group.push(i);
        } else {
          // if not, start a new group
          repeat_groups.push(curr_group);
          curr_group = [i];
          marker = orderItem;
        }
      }
    } else {
      // if it is not a repeated item, then wrap up here.
      if (curr_group.length > 0) {
        repeat_groups.push(curr_group);
        curr_group = [];
        marker = undefined
      }
    }
  }
  if (curr_group.length > 0) {
    repeat_groups.push(curr_group);
    curr_group = [];
    marker = undefined
  }
  // treatment (Backward)
  for (let rgi = repeat_groups.length - 1; rgi >= 0; rgi--) {
    let group = repeat_groups[rgi];
    let orderItems = group.map(i => output[i]);
    let repeat_item: RepeatOrderItemNormed = {
      type: OrderingTypeRepeat,
      group_id: group[0],
      repeat: orderItems as Array<MarkupOrderItemNormed | TextOrderItemNormed | SoundOrderItemNormed>,
      description: "Repeat (auto-grouped)"
    }
    output.splice(group[0], group.length, repeat_item)
  }
  return output;
}


function normalizeSpecifier(
  specifer: Specifier,
  sonificationSpec: NormalizedStreamItem[]
): { normedSpecifier: SpecifierNormed, specified: RecordObject } {
  let hasIntroSeq = 'intro' in sonificationSpec[0];
  let normed: SpecifierNormed = {
    role: specifer.role,
  };
  let specified: RecordObject = {};
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
    specified.stream = selectedStream;
    normed.streamId = streamId;
    if ('stream' in selectedStream && selectedStream.stream.encoding.repeat) {
      if ([RoleRepeatTitle, RoleStreamSound].includes(specifer.role)) {
        normed.is_repeated = true;
      }
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
      specified.overlay = selectedOverlay;
    }
  }
  let normedSpecifier = normed;
  return { normedSpecifier, specified };
}

function matchSpecifiedStream(src: SpecifierNormed, tar: SpecifierNormed): boolean {
  return (src.streamId === tar.streamId && src.overlayId === tar.overlayId);
}