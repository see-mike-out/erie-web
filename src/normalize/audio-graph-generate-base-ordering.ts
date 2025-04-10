import {
  ConfigInterface, MarkupOrderItemNormed, NormalizedStreamItem, OmitDesc, OrderingTypeMarkup, OrderingTypeRepeat, OrderingTypeSound,
  OrderSpecNormed, RoleDescription, RoleLength,
  RoleRepeatTitle,
  RoleScaleDescription, RoleScaleOverview, RoleStreamSound, RoleTitle, ScaleDescriptionOrder,
  SoundOrderItemNormed,
  TextOrderItemNormed
} from "../types";

export function generateBaseOrderSpec(
  audio_spec: NormalizedStreamItem[],
  config: ConfigInterface
): OrderSpecNormed {
  let order_spec: OrderSpecNormed = [];
  // title
  let group_index = 0;
  for (const item of audio_spec) {
    if ('intro' in item) {
      if (item.intro.title && !item.intro.skipTitle) {
        order_spec.push({
          type: OrderingTypeMarkup,
          group_id: group_index,
          specifier: {
            role: RoleTitle,
            streamId: item.id
          }
        });
        group_index++;
      }
      if (item.intro.description && !item.intro.skipDescription) {
        order_spec.push({
          type: OrderingTypeMarkup,
          group_id: group_index,
          specifier: {
            role: RoleDescription,
            streamId: item.id
          }
        });
        group_index++;
      }
      if (audio_spec.length >= 2 && !item.intro.skipLength) {
        order_spec.push({
          type: OrderingTypeMarkup,
          group_id: group_index,
          specifier: {
            role: RoleLength
          }
        });
        group_index++;
      }
    } else {
      if ('title' in item && item.title && !item.skipTitle) {
        order_spec.push({
          type: OrderingTypeMarkup,
          group_id: group_index,
          specifier: {
            role: RoleTitle,
            streamId: item.id,
          }
        });
        group_index++;
      }
      if ('description' in item && item.description && !item.skipDescription) {
        order_spec.push({
          type: OrderingTypeMarkup,
          group_id: group_index,
          specifier: {
            role: RoleDescription,
            streamId: item.id,
          }
        });
        group_index++;
      }
      if ('overlay' in item) {
        // for each overaly stream
        if (!item.skipLength) {
          order_spec.push({
            type: OrderingTypeMarkup,
            group_id: group_index,
            specifier: {
              role: RoleLength
            }
          });
          group_index++;
        }
        for (const overlay of item.overlay) {
          if ('title' in overlay && overlay.title && !overlay.skipTitle) {
            order_spec.push({
              type: OrderingTypeMarkup,
              group_id: group_index,
              specifier: {
                role: RoleTitle,
                streamId: item.id,
                overlayId: overlay.id
              }
            });
            group_index++;
          }
          if ('description' in overlay && overlay.description && !overlay.skipDescription) {
            order_spec.push({
              type: OrderingTypeMarkup,
              group_id: group_index,
              specifier: {
                role: RoleDescription,
                streamId: item.id,
                overlayId: overlay.id
              }
            });
            group_index++;
          }
          // scales
          let n_scales_to_play = Object.keys(overlay.encoding).filter((chn) => !overlay.encoding[chn].skipDescription && !OmitDesc.includes(chn)).length;
          if (n_scales_to_play > 0) {
            order_spec.push({
              type: OrderingTypeMarkup,
              group_id: group_index,
              specifier: {
                role: RoleScaleOverview,
                streamId: item.id,
                overlayId: overlay.id
              }
            });
            group_index++;
            let announced: string[] = [];
            for (const channel_name of ScaleDescriptionOrder) {
              if (channel_name in overlay.encoding && !overlay.encoding[channel_name].skipDescription) {
                order_spec.push({
                  type: OrderingTypeMarkup,
                  group_id: group_index,
                  specifier: {
                    role: RoleScaleDescription,
                    streamId: item.id,
                    overlayId: overlay.id,
                    channel: channel_name
                  }
                });
                group_index++;
                announced.push(channel_name);
              }
            }
            for (const channel_name in overlay.encoding) {
              if (!announced.includes(channel_name) && !OmitDesc.includes(channel_name) && !overlay.encoding[channel_name].skipDescription) {
                order_spec.push({
                  type: OrderingTypeMarkup,
                  group_id: group_index,
                  specifier: {
                    role: RoleScaleDescription,
                    streamId: item.id,
                    overlayId: overlay.id,
                    channel: channel_name
                  }
                });
                group_index++;
                announced.push(channel_name);
              }
            }
          }
        }
        order_spec.push({
          type: OrderingTypeSound,
          group_id: group_index,
          specifier: {
            role: RoleStreamSound,
            streamId: item.id
          }
        });
        group_index++;
      } else if ('stream' in item) {
        let is_repeated = 'repeat' in item.stream.encoding;
        if ('title' in item.stream && item.stream.title && !item.stream.skipTitle) {
          order_spec.push({
            type: OrderingTypeMarkup,
            group_id: group_index,
            specifier: {
              role: RoleTitle,
              streamId: item.id
            }
          });
          group_index++;
        }
        if ('description' in item.stream && item.stream.description && !item.stream.skipDescription) {
          order_spec.push({
            type: OrderingTypeMarkup,
            group_id: group_index,
            specifier: {
              role: RoleDescription,
              streamId: item.id
            }
          });
          group_index++;
        }
        // scales
        let n_scales_to_play = Object.keys(item.stream.encoding).filter((chn) => !item.stream.encoding[chn].skipDescription && !OmitDesc.includes(chn)).length;
        if (n_scales_to_play > 0) {
          order_spec.push({
            type: OrderingTypeMarkup,
            group_id: group_index,
            specifier: {
              role: RoleScaleOverview,
              streamId: item.id
            }
          });
          group_index++;
          let announced: string[] = [];
          for (const channel_name of ScaleDescriptionOrder) {
            if (channel_name in item.stream.encoding && !item.stream.encoding[channel_name].skipDescription) {
              order_spec.push({
                type: OrderingTypeMarkup,
                group_id: group_index,
                specifier: {
                  role: RoleScaleDescription,
                  streamId: item.id,
                  channel: channel_name
                }
              });
              group_index++;
              announced.push(channel_name);
            }
          }
          for (const channel_name in item.stream.encoding) {
            if (!announced.includes(channel_name) && !OmitDesc.includes(channel_name) && !item.stream.encoding[channel_name].skipDescription) {
              order_spec.push({
                type: OrderingTypeMarkup,
                group_id: group_index,
                specifier: {
                  role: RoleScaleDescription,
                  streamId: item.id,
                  channel: channel_name
                }
              });
              group_index++;
              announced.push(channel_name);
            }
          }
        }
        if (is_repeated) {
          let repeat_spec: Array<MarkupOrderItemNormed | TextOrderItemNormed | SoundOrderItemNormed> = [];
          let repeat_group_index = 0;
          if (!item.stream.encoding.repeat.skipDescription) {
            repeat_spec.push({
              type: OrderingTypeMarkup,
              group_id: repeat_group_index,
              specifier: {
                role: RoleRepeatTitle,
                streamId: item.id,
                is_repeated
              }
            });
            repeat_group_index++;
          }
          repeat_spec.push({
            type: OrderingTypeSound,
            group_id: repeat_group_index,
            specifier: {
              role: RoleStreamSound,
              streamId: item.id,
              is_repeated
            }
          });
          order_spec.push({
            type: OrderingTypeRepeat,
            group_id: group_index,
            repeat: repeat_spec
          })
          group_index++;
        } else {
          order_spec.push({
            type: OrderingTypeSound,
            group_id: group_index,
            specifier: {
              role: RoleStreamSound,
              streamId: item.id
            }
          });
          group_index++;
        }
      }
    }
  }
  return order_spec;
}