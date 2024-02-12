import { applyTransforms } from "../data/audio-graph-apply-transform";
import { STATIC, TIME_chn, TMP } from "../scale/audio-graph-scale-constant";
import { getAudioScales } from "../scale/audio-graph-scale-wrap";
import { makeBeatFunction, makeBeatRounder } from "../scale/audio-graph-time-convert";
import { detectType, jType } from "../util/audio-graph-typing-util";
import { deepcopy } from "../util/audio-graph-util";

export function tidyUpScaleDefinitions(scaleDefinitions, normalizedSpecs, sequenceConfig) {
  // directly updates the scale definitions, and returns the ids of scales to be removed, which can be later handled.
  let sequenceScaleConsistency = sequenceConfig?.sequenceScaleConsistency || {};
  let forceSequenceScaleConsistency = sequenceConfig?.forceSequenceScaleConsistency || {};
  let removals = [];
  for (const stream of normalizedSpecs) {
    if (stream.stream) {
      Object.keys(stream.stream.encoding).forEach((channel) => {
        let match;
        if (sequenceScaleConsistency[channel] && !forceSequenceScaleConsistency[channel]) {
          match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, !forceSequenceScaleConsistency[channel]);
        } else if (forceSequenceScaleConsistency[channel]) {
          match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, forceSequenceScaleConsistency[channel]);
        }
        if (match) {
          if (match.id !== stream.stream.encoding[channel].scale.id) {
            match.field.push(stream.stream.encoding[channel].field);
            removals.push(stream.stream.encoding[channel].scale.id);
            Object.keys(stream.stream.encoding[channel].scale).forEach(prop => {
              if (!match.scale[prop]) match.scale[prop] = stream.stream.encoding[channel].scale[prop]
            });
            stream.stream.encoding[channel].scale.id = match.id;
          }
        }
      })
    } else if (stream.overlay) {
      for (const overlayStream of stream.overlay) {
        let overlayScaleConsistency = stream?.config?.overlayScaleConsistency || sequenceConfig?.overlayScaleConsistency || {};
        let forceOverlayScaleConsistency = stream?.config?.forceOverlayScaleConsistency || sequenceConfig?.forceOverlayScaleConsistency || {};
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
            if (match.id !== overlayStream.encoding[channel].scale.id) {
              match.field.push(overlayStream.encoding[channel].field);
              removals.push(overlayStream.encoding[channel].scale.id);
              Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
                if (!match.scale[prop]) match.scale[prop] = overlayStream.encoding[channel].scale[prop]
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

function findScaleMatch(scaleDefinitions, encoding, matchParent, matchData) {
  // matchParent (whether overlay's scales are consistent to those of parent sequence)
  // matchData (whether to force scale consistency even if data is different)
  let thisDef;
  for (const def of scaleDefinitions) {
    if (def.id === encoding.scale.id) thisDef = def;
  }
  for (const def of scaleDefinitions) {
    if (def.channel === thisDef.channel && def.type === thisDef.type) {
      if (def.channel === TIME_chn && def.scale.timing !== thisDef.scale.timing) continue;
      if (matchData && matchParent) {
        if (def.dataName === thisDef.dataName && def.parentID === thisDef.parentID) return def;
      } else if (!matchData && matchParent) {
        if (def.parentID === thisDef.parentID) return def;
      } else if (matchData && !matchParent) {
        if (def.dataName === thisDef.dataName) return def;
      } else {
        return def;
      }
    }
    if (def.id === encoding.scale.id) return def;
  }

  return null;
}

export async function getChannelType(loaded_datasets, spec, untyped_channels) {
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
      spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
    }
  }

  data = applyTransforms(data, spec);

  // after transforms
  for (const channel of Object.keys(spec.encoding)) {
    if (!spec.encoding[channel].type && spec.encoding[channel].value !== undefined) {
      spec.encoding[channel].type = STATIC;
    } else if (!spec.encoding[channel].type) {
      spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
    }
  }
}

export async function makeScales(scaleHash, normalized, loaded_datasets, config) {
  let scaleInfo = deepcopy(scaleHash);
  Object.keys(scaleInfo).forEach((scaleId) => {
    scaleInfo[scaleId].collected = [];
  });
  let beat;
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
    if (stream.stream) {
      let data = loaded_datasets[stream.stream.data.name];
      data = applyTransforms(data, stream.stream);
      let encoding = stream.stream.encoding;
      for (const cname of Object.keys(encoding)) {
        let scaleId = encoding[cname].scale.id;
        scaleInfo[scaleId].data = data;
        if (encoding[cname].field) {
          let collectionKey = stream.stream.data.name + "_" + encoding[cname].field;
          if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
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
    } else if (stream.overlay) {
      for (const overlay of stream.overlay) {
        let data = loaded_datasets[overlay.data.name];
        data = applyTransforms(data, overlay);
        let encoding = overlay.encoding;
        for (const cname of Object.keys(encoding)) {
          let scaleId = encoding[cname].scale.id;
          scaleInfo[scaleId].data = data;
          if (encoding[cname].field) {
            let collectionKey = overlay.data.name + "_" + encoding[cname].field;
            if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
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
  // 2. make scale functions
  let scaleFunctions = {}
  for (const scaleId of Object.keys(scaleInfo)) {
    let scaleDef = scaleInfo[scaleId];
    let channel = scaleDef.channel;

    let o = {};
    Object.assign(o, scaleDef);
    scaleFunctions[scaleId] = getAudioScales(channel, o, scaleDef.values, beat, scaleDef.data);
  }
  if (beat) scaleFunctions.__beat = beat;
  return scaleFunctions;
}


function scaleInfoUpdater(channel, scaleInfo, data) {
  let field = channel.field;
  let scaleId = channel.scale.id;
  if (scaleInfo[scaleId]) {
    if (!scaleInfo[scaleId].values) scaleInfo[scaleId].values = [];
    let datums = [];
    if (jType(field) === 'Array') {
      field.forEach((f) => {
        datums.push(...data.map((d, i) => d[f]))
      });
    } else {
      datums.push(...data.map((d, i) => d[field]))
    }
    if (scaleInfo[scaleId].type === TMP) {
      datums = datums.map((d) => new Date(d));
    }
    scaleInfo[scaleId].values.push(...datums)
  }
}