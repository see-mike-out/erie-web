import { applyTransforms } from "../data/audio-graph-apply-transform";
import { TIME_chn } from "../scale/audio-graph-scale-constant";
import { getAudioScales } from "../scale/audio-graph-scale-wrap";
import { detectType, jType } from "../util/audio-graph-typing-util";
import { deepcopy } from "../util/audio-graph-util";

export function tidyUpScaleDefinitions(scaleDefinitions, normalizedSpecs, sequenceConfig) {
  let sequenceScaleConsistency = sequenceConfig?.sequenceScaleConsistency || true;
  let forceSequenceScaleConsistency = sequenceConfig?.forceSequenceScaleConsistency || false;
  let removals = [];
  for (const stream of normalizedSpecs) {
    if (stream.stream && sequenceScaleConsistency) {
      Object.keys(stream.stream.encoding).forEach((channel) => {
        let match = findScaleMatch(scaleDefinitions, stream.stream.encoding[channel], false, !forceSequenceScaleConsistency);
        if (match.id !== stream.stream.encoding[channel].scale.id) {
          match.field.push(stream.stream.encoding[channel].field);
          removals.push(stream.stream.encoding[channel].scale.id);
          Object.keys(stream.stream.encoding[channel].scale).forEach(prop => {
            if (!match.scale[prop]) match.scale[prop] = stream.stream.encoding[channel].scale[prop]
          });
          stream.stream.encoding[channel].scale.id = match.id;
        }

      })
    } else if (stream.overlay && sequenceScaleConsistency) {
      for (const overlayStream of stream.overlay) {
        Object.keys(overlayStream.encoding).forEach((channel) => {
          let match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], false, !forceSequenceScaleConsistency);
          if (match.id !== overlayStream.encoding[channel].scale.id) {
            match.field.push(overlayStream.encoding[channel].field);
            removals.push(overlayStream.encoding[channel].scale.id);
            Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
              if (!match.scale[prop]) match.scale[prop] = overlayStream.encoding[channel].scale[prop]
            });
            overlayStream.encoding[channel].scale.id = match.id;
          }
        })
      }
    } else if (stream.overlay && !sequenceScaleConsistency) {
      let overlayScaleConsistency = stream.config?.overlayScaleConsistency || true;
      let forceOverlayScaleConsistency = stream.config?.forceOverlayScaleConsistency || false;
      if (overlayScaleConsistency) {
        for (const overlayStream of stream.overlay) {
          Object.keys(overlayStream.encoding).forEach((channel) => {
            let match = findScaleMatch(scaleDefinitions, overlayStream.encoding[channel], true, !forceOverlayScaleConsistency);
            if (match.id !== overlayStream.encoding[channel].scale.id) {
              match.field.push(overlayStream.encoding[channel].field);
              removals.push(stream.stream.encoding[channel].scale.id);
              Object.keys(overlayStream.encoding[channel].scale).forEach(prop => {
                if (!match.scale[prop]) match.scale[prop] = overlayStream.encoding[channel].scale[prop]
              });
              overlayStream.encoding[channel].scale.id = match.id;
            }
          })
        }
      }
    }
  }
  return removals;
}

function findScaleMatch(scaleDefinitions, encoding, matchParent, matchData) {
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
    if (!spec.encoding[channel].type) {
      spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
    }
  }

  data = applyTransforms(data, spec);

  // after transforms
  for (const channel of Object.keys(spec.encoding)) {
    if (!spec.encoding[channel].type) {
      spec.encoding[channel].type = detectType(data.map((d) => d[spec.encoding[channel].field]));
    }
  }
}

export async function makeScales(scaleHash, normalized, loaded_datasets) {
  let scaleInfo = deepcopy(scaleHash)
  Object.keys(scaleInfo).forEach((scaleId) => {
    scaleInfo[scaleId].collected = [];
  });
  // 1. update scale information
  for (const stream of normalized) {
    if (stream.stream) {
      let data = loaded_datasets[stream.stream.data.name];
      data = applyTransforms(data, stream.stream);
      let encoding = stream.stream.encoding;
      for (const cname of Object.keys(encoding)) {
        let collectionKey = stream.stream.data.name + "_" + encoding[cname].field;
        let scaleId = encoding[cname].scale.id;
        if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
          scaleInfoUpdater(encoding[cname], scaleInfo, data);
          scaleInfo[scaleId].collected.push(collectionKey);
        }
      }
    } else if (stream.overlay) {
      for (const overlay of stream.overlay) {
        let data = loaded_datasets[overlay.data.name];
        data = applyTransforms(data, overlay);
        let encoding = overlay.encoding;
        for (const cname of Object.keys(encoding)) {
          let collectionKey = overlay.data.name + "_" + encoding[cname].field;
          let scaleId = encoding[cname].scale.id;
          if (!scaleInfo[scaleId].collected.includes(collectionKey)) {
            scaleInfoUpdater(encoding[cname], scaleInfo, data);
            scaleInfo[scaleId].collected.push(collectionKey);
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
    scaleFunctions[scaleId] = getAudioScales(channel, o, scaleDef.values);
  }
  return scaleFunctions;
}


function scaleInfoUpdater(channel, scaleInfo, data) {
  let field = channel.field;
  let scaleId = channel.scale.id;
  if (scaleInfo[scaleId]) {
    if (!scaleInfo[scaleId].values) scaleInfo[scaleId].values = [];
    if (jType(field) === 'Array') {
      field.forEach((f) => {
        scaleInfo[scaleId].values.push(...data.map((d, i) => d[f] || i))
      });
    } else {
      scaleInfo[scaleId].values.push(...data.map((d, i) => d[field] || i))
    }
  }
}