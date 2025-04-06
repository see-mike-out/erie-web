import { applyTransforms } from "../data";
import {
  getAudioScales,
  makeBeatFunction,
  makeBeatRounder
} from "../scale";
import {
  BeatObject,
  ConfigInterface,
  Datum,
  EncodingItemNormed,
  LoadedDatasets,
  NormalizedSingleStream,
  NormalizedStreamItem,
  ParsedScaleDefinition,
  ScaleCollection,
  ScaleConsistencyRecord,
  ScaleType,
  STATIC,
  TIME_chn,
  TMP,
  TransformerFunction
} from "../types";
import {
  deepcopy
} from "../util";
import { detectType } from "./audio-graph-compile-utils";

export function tidyUpScaleDefinitions(
  scaleDefinitions: ParsedScaleDefinition[],
  normalizedSpecs: NormalizedStreamItem[],
  sequenceConfig: ConfigInterface
): string[] {
  // directly updates the scale definitions, and returns the ids of scales to be removed, which can be later handled.
  let sequenceScaleConsistency: ScaleConsistencyRecord = sequenceConfig?.sequenceScaleConsistency as ScaleConsistencyRecord ?? {};
  let forceSequenceScaleConsistency: ScaleConsistencyRecord = sequenceConfig?.forceSequenceScaleConsistency as ScaleConsistencyRecord ?? {};
  let removals: string[] = [];
  for (const stream of normalizedSpecs) {
    if ('stream' in stream && stream.stream) {
      Object.keys(stream.stream.encoding).forEach((channel) => {
        let match;
        if (sequenceScaleConsistency[channel]
          && !forceSequenceScaleConsistency[channel]) {
          match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, !forceSequenceScaleConsistency[channel]);
        } else if (forceSequenceScaleConsistency[channel]) {
          match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, forceSequenceScaleConsistency[channel]);
        }
        if (match) {
          if (stream.stream.encoding?.[channel]?.scale?.id
            && match.id !== stream.stream.encoding?.[channel]?.scale?.id) {
            // once normalized, even "aggregate: count" should have a field name instead
            if (stream.stream.encoding[channel].field) {
              if (typeof stream.stream.encoding[channel].field === 'string') {
                match.field.push(stream.stream.encoding[channel].field);
              } else if (stream.stream.encoding[channel].field instanceof Array) {
                match.field.push(...stream.stream.encoding[channel].field);
              }
            }
            removals.push(stream.stream.encoding[channel].scale.id);
            Object.keys(stream.stream.encoding[channel].scale).forEach((prop) => {
              if (!match.scale[prop]) {
                match.scale[prop] = stream.stream.encoding?.[channel]?.scale?.[prop as keyof ScaleType]
              }
            });
            stream.stream.encoding[channel].scale.id = match.id;
          }
        }
      })
    } else if ('overlay' in stream && stream.overlay) {
      for (const overlayStream of stream.overlay) {
        let overlayScaleConsistency: ScaleConsistencyRecord
          = stream?.config?.overlayScaleConsistency as ScaleConsistencyRecord
          || sequenceConfig?.overlayScaleConsistency as ScaleConsistencyRecord
          || {};
        let forceOverlayScaleConsistency: ScaleConsistencyRecord
          = stream?.config?.forceOverlayScaleConsistency as ScaleConsistencyRecord
          || sequenceConfig?.forceOverlayScaleConsistency as ScaleConsistencyRecord
          || {};
        Object.keys(overlayStream.encoding).forEach((channel) => {
          let match;
          if (sequenceScaleConsistency[channel] && !forceSequenceScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, !forceSequenceScaleConsistency[channel]);
          } else if (forceSequenceScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, forceSequenceScaleConsistency[channel]);
          } else if (overlayScaleConsistency[channel] && !forceOverlayScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, !forceOverlayScaleConsistency[channel]);
          } else if (forceOverlayScaleConsistency[channel]) {
            match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, forceOverlayScaleConsistency[channel]);
          }
          if (match) {
            if (overlayStream.encoding?.[channel]?.scale?.id
              && match.id !== overlayStream.encoding?.[channel]?.scale?.id) {
              // once normalized, even "aggregate: count" should have a field name instead
              if (overlayStream.encoding[channel].field) {
                if (typeof overlayStream.encoding[channel].field === 'string') {
                  match.field.push(overlayStream.encoding[channel].field);
                } else if (overlayStream.encoding[channel].field instanceof Array) {
                  match.field.push(...overlayStream.encoding[channel].field);
                }
              }
              removals.push(overlayStream.encoding?.[channel]?.scale?.id);
              Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
                if (!match.scale[prop]) match.scale[prop] = overlayStream.encoding?.[channel]?.scale?.[prop as keyof ScaleType]
              });
              overlayStream.encoding[channel].scale.id = match.id;
            }
          }
        })
      }
    }
  }
  return removals;
}

function findScaleMatch(
  scaleDefinitions: ParsedScaleDefinition[],
  encoding: EncodingItemNormed,
  matchParent: boolean,
  matchData: boolean) {
  // matchParent (whether overlay's scales are consistent to those of parent sequence)
  // matchData (whether to force scale consistency even if data is different)
  let thisDef!: ParsedScaleDefinition;
  for (const def of scaleDefinitions) {
    if (def.id === encoding.scale?.id) thisDef = def;
  }
  if (thisDef) {
    for (const def of scaleDefinitions) {
      if (def.channel === thisDef.channel && def.type === thisDef.type) {
        if (def.channel === TIME_chn && def.scale.timing !== thisDef.scale.timing) continue;
        if (matchData && matchParent) {
          if (def.dataName === thisDef.dataName && def.parentId === thisDef.parentId) return def;
        } else if (!matchData && matchParent) {
          if (def.parentId === thisDef.parentId) return def;
        } else if (matchData && !matchParent) {
          if (def.dataName === thisDef.dataName) return def;
        } else {
          return def;
        }
      }
      if (def.id === encoding.scale?.id) return def;
    }
  }

  return null;
}

export async function getChannelType(
  loaded_datasets: LoadedDatasets,
  spec: NormalizedSingleStream,
  untyped_channels: string[]) {
  let data = loaded_datasets[spec.data.name];

  if (!data || !spec.encoding) {
    console.error("No proper layer spec provided.")
    return undefined;
  }

  // before transforms
  for (const channel of Object.keys(spec.encoding)) {
    if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
      spec.encoding[channel].type = STATIC;
    } else if (!spec.encoding[channel].type) {
      let f = spec.encoding[channel].field instanceof Array ? spec.encoding[channel].field[0] : spec.encoding[channel].field
      spec.encoding[channel].type = detectType(
        data.map((d) => f ? d[f] : undefined)
          .filter(d => d !== undefined)
      );
    }
  }

  data = applyTransforms(data, spec);

  // after transforms
  for (const channel of Object.keys(spec.encoding)) {
    if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
      spec.encoding[channel].type = STATIC;
    } else if (!spec.encoding[channel].type) {
      let f = spec.encoding[channel].field instanceof Array ? spec.encoding[channel].field[0] : spec.encoding[channel].field
      spec.encoding[channel].type = detectType(
        data.map((d) => f ? d[f] : undefined)
          .filter(d => d !== undefined)
      );
    }
  }
}

export async function makeScales(
  scaleHash: { [key: string]: ParsedScaleDefinition },
  normalized: NormalizedStreamItem[],
  loaded_datasets: LoadedDatasets,
  config: ConfigInterface
): Promise<ScaleCollection> {
  let scaleInfo = deepcopy(scaleHash);
  Object.keys(scaleInfo).forEach((scaleId) => {
    scaleInfo[scaleId].collected = [];
  });
  let beat: BeatObject | undefined;
  if (config?.timeUnit) {
    if (config.timeUnit.unit === 'beat') {
      beat = {
        converter: makeBeatFunction(config.timeUnit.tempo || 100)
      };
      let roundStart = true, roundDuration = false;
      if (config.timeUnit.rounding) {
        roundStart = (config.timeUnit.rounding !== 'never');
        roundDuration = (config.timeUnit.rounding === 'always');
      }
      if (roundStart) {
        beat.roundStart = makeBeatRounder(config.timeUnit.tempo || 100, config.timeUnit.roundingBy || 1);
      }
      if (roundDuration) {
        beat.roundDuration = makeBeatRounder(config.timeUnit.tempo || 100, config.timeUnit.roundingBy || 1)
      }
    }
  }
  // 1. update scale information
  for (const stream of normalized) {
    if ('stream' in stream && stream.stream) {
      let data = !config.is_streaming ? loaded_datasets[stream.stream.data.name] : [];
      let transformer!: TransformerFunction;
      if (!config.is_streaming) {
        data = applyTransforms(data, stream.stream);
      } else if (config.is_streaming) {
        data = [];
      }
      let encoding = stream.stream.encoding;
      for (const cname of Object.keys(encoding)) {
        let scaleId = encoding[cname]?.scale?.id;
        if (scaleId) {
          scaleInfo[scaleId].data = data;
          if (encoding[cname].field) {
            let collectionKey = stream.stream.data.name + "_" + (encoding[cname].field instanceof Array ? encoding[cname].field.join("_") : encoding[cname].field);
            if (scaleInfo[scaleId].collected
              && !scaleInfo[scaleId].collected.includes(collectionKey)) {
              scaleInfoUpdater(encoding[cname], scaleInfo, data);
              scaleInfo[scaleId].collected.push(collectionKey);
            }
          } else if (encoding[cname].value !== undefined) {
            scaleInfo[scaleId].type = STATIC;
            scaleInfo[scaleId].value = encoding[cname].value;
          }
          if (encoding[cname].format) {
            scaleInfo[scaleId].format = encoding[cname].format
          }
          if (encoding[cname].formatType) {
            scaleInfo[scaleId].formatType = encoding[cname].formatType
          }
          if (encoding[cname].roundToNote) {
            scaleInfo[scaleId].roundToNote = encoding[cname].roundToNote
          }
        }
      }
    } else if ('overlay' in stream && stream.overlay) {
      for (const overlay of stream.overlay) {
        let data = loaded_datasets[overlay.data.name];
        data = applyTransforms(data, overlay);
        let encoding = overlay.encoding;
        for (const cname of Object.keys(encoding)) {
          let scaleId = encoding[cname]?.scale?.id;
          if (scaleId) {
            scaleInfo[scaleId].data = data;
            if (encoding[cname].field) {
              let collectionKey = overlay.data.name + "_" + encoding[cname].field;
              if (scaleInfo[scaleId].collected
                && !scaleInfo[scaleId].collected.includes(collectionKey)) {
                scaleInfoUpdater(encoding[cname], scaleInfo, data);
                scaleInfo[scaleId].collected.push(collectionKey);
              }
            } else if (encoding[cname].value !== undefined) {
              scaleInfo[scaleId].type = STATIC;
              scaleInfo[scaleId].value = encoding[cname].value;
            }
            if (encoding[cname].format) {
              scaleInfo[scaleId].format = encoding[cname].format
            }
            if (encoding[cname].formatType) {
              scaleInfo[scaleId].formatType = encoding[cname].formatType
            }
          }
        }
      }
    }
  }
  // 2. make scale functions
  let scaleFunctions: ScaleCollection = {};
  for (const scaleId of Object.keys(scaleInfo)) {
    let scaleDef = scaleInfo[scaleId];
    let channel = scaleDef.channel;

    let o: ParsedScaleDefinition = deepcopy(scaleDef);
    if (scaleDef.values === undefined && scaleDef.data === undefined && scaleDef.value === undefined) {
      console.error("Value not assigned", scaleDef);
    } else {
      let s = getAudioScales(channel, o, scaleDef.values, beat, scaleDef.data);
      if (s) scaleFunctions[scaleId] = s;
      else {
        console.error("Couldn't get the scale function", channel, o, scaleDef.values, beat, scaleDef.data);
      }
    }
  }
  if (beat) scaleFunctions.__beat = beat;
  return scaleFunctions;
}


function scaleInfoUpdater(
  channel: EncodingItemNormed,
  scaleInfo: { [key: string]: ParsedScaleDefinition },
  data: Datum[]
): void {
  let field = channel.field;
  let scaleId = channel?.scale?.id;
  if (scaleId && scaleInfo[scaleId]) {
    if (!scaleInfo[scaleId].values) scaleInfo[scaleId].values = [];
    let datums = [];
    if (field instanceof Array) {
      field.forEach((f) => {
        datums.push(...data.map((d, i) => d[f]))
      });
    } else {
      datums.push(...data.map((d, i) => d[field as string]))
    }
    if (scaleInfo[scaleId].type === TMP) {
      datums = datums.map((d) => new Date(d));
    }
    scaleInfo[scaleId].values.push(...datums)
  }
}