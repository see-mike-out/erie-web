import { OVERLAY, QUANT, REPEAT_chn, SEQUENCE, SIM_TIMING, SPEECH_AFTER_chn, SPEECH_BEFORE_chn, TAPCNT_chn, TAPSPD_chn, TIME2_chn, TIME_chn, RampMethods } from "../scale/audio-graph-scale-constant";
import { toHashedObject } from "../util/audio-graph-format-util";
import { jType } from "../util/audio-graph-typing-util";
import { deepcopy, genRid, unique } from "../util/audio-graph-util";

export async function normalizeSpecification(_spec) {
  let spec = deepcopy(_spec);
  let streams = [],
    datasets = deepcopy(spec.datasets || []),
    synths = deepcopy(spec.synth || []),
    samplings = deepcopy(spec.sampling || []),
    tickDefs = deepcopy(spec.tick || []),
    waves = deepcopy(spec.wave || []),
    scales = [],
    config;
  let used_encodings = [];
  if (isSingleStream(spec)) {
    if (spec.data) {
      let new_data_name = "data__" + (datasets.length + 1)
      datasets.push({
        name: new_data_name,
        ...deepcopy(spec.data)
      });
      spec.data = { name: new_data_name }
    }
    let { normalized, scaleDefinitions } = normalizeSingleSpec(spec, null);
    streams.push({ stream: normalized });
    scales.push(...scaleDefinitions);
    used_encodings.push(...Object.keys(normalized.encoding));
  } else {
    let new_data_name;
    if (spec.data && !spec.data.name) {
      new_data_name = "data__" + (datasets.length + 1)
      datasets.push({
        name: new_data_name,
        ...deepcopy(spec.data)
      });
    }
    if (isOverlayStream(spec)) {
      // (needs verification)
      let overlay = [];
      let h_data, h_data_name;
      if (spec.data && !spec.data.name) {
        h_data = deepcopy(spec.data);
        h_data_name = `data__${(datasets.length + 1)}`;
        datasets.push({ name: h_data_name, ...h_data });
      } else if (spec.data?.name) {
        h_data = deepcopy(spec.data);
      }
      for (const _o of spec.overlay) {
        let o = deepcopy(_o);
        if (h_data && !o.data) {
          if (h_data_name) {
            o.data = { name: h_data_name };
          } else if (!o.data) {
            o.data = h_data;
          }
        } else if (o.data) {
          if (!o.data.name) {
            let dname = `data__${(datasets.length + 1)}`;
            datasets.push({ name: dname, ...o.data });
            o.data = { name: dname };
          }
        }
        if (o.encoding?.time.tick) {
          if (!o.encoding?.time.tick.name || !tickDefs.filter((d) => d.name === o.encoding?.time.tick.name)) {
            let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
            tickDefs.push({
              ...o.encoding?.time.tick,
              name: new_tick_name,
            });
            o.encoding.time.tick = { name: new_tick_name };
          }
        }
        if (!o.data) o.data = { name: new_data_name };
        o.common_transform = deepcopy(spec.transform || []);
        o.transform = deepcopy(_o.transform || []);
        if (!isSingleStream(_o)) console.error("An overlay of multi-stream sequences is not supported!");
        let n = normalizeSingleSpec(o, OVERLAY);
        used_encodings.push(...Object.keys(n.normalized.encoding));
        overlay.push(n.normalized);
        scales.push(...n.scaleDefinitions);
      }
      let config = {}
      Object.assign(config, spec.config);
      normalizeScaleConsistency(config, unique(used_encodings));
      delete config.sequenceScaleConsistency;
      delete config.forceSequenceScaleConsistency;
      streams.push({ overlay, name: spec.name, title: spec.title, description: spec.description, config });
    } else if (isSequenceStream(spec)) {
      let output = [];
      let introSeq = {};
      config = {}
      Object.assign(config, spec.config);
      if (spec.title) {
        introSeq.title = spec.title;
      }
      if (spec.description) {
        introSeq.description = spec.description;
      }
      if (Object.keys(introSeq).length > 0) {
        output.push({ intro: introSeq })
      }
      for (const _o of spec.sequence) {
        let o = deepcopy(_o);
        if (isSequenceStream(_o)) console.error("A sequence of sequence is not supported!")
        if (isSingleStream(o)) {
          if (o.encoding?.time.tick) {
            if (!o.encoding?.time.tick.name || !tickDefs.filter((d) => d.name === o.encoding?.time.tick.name)) {
              let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
              tickDefs.push({
                ...o.encoding?.time.tick,
                name: new_tick_name,
              });
              o.encoding.time.tick = { name: new_tick_name };
            }
          }
          if (!o.data) o.data = { name: new_data_name };
          else if (o.data?.values) {
            let new_data_name_2 = "data__" + (datasets.length + 1);
            datasets.push({
              name: new_data_name_2,
              values: deepcopy(o.data.values)
            });
            o.data = { name: new_data_name_2 };
          }
          o.common_transform = deepcopy(spec.transform || []);
          o.transform = deepcopy(_o.transform || []);
          let n = normalizeSingleSpec(o, SEQUENCE);
          scales.push(...n.scaleDefinitions);
          output.push(n.normalized);
          used_encodings.push(...Object.keys(n.normalized.encoding));
        } else if (isOverlayStream(o)) {
          o.id = 'overlay-' + genRid();
          let n = await normalizeSpecification(o);
          let over = n.normalized[0];
          over.id = o.id;
          output.push(over);
          n.scaleDefinitions.forEach((d) => {
            d.parentId = over.id
          });
          n.normalized[0].overlay.forEach((ov) => {
            used_encodings.push(...Object.keys(ov.encoding));
          });
          scales.push(...n.scaleDefinitions);
          Object.assign(datasets, n.datasets);
          Object.assign(tickDefs, n.tick);
        }
      }
      normalizeScaleConsistency(config, unique(used_encodings));
      delete config.overlayScaleConsistency;
      delete config.forceOverlayScaleConsistency;
      streams.push(...output.map((d) => {
        if (d.intro) {
          return { intro: d.intro }
        } else if (d.overlay) {
          return {
            overlay: d.overlay || d,
            id: d.overlay.id || d.id,
            name: d.overlay.name || d.name,
            title: d.overlay.title || d.title,
            description: d.overlay.description || d.description,
            config: d.config
          }
        } else {
          return { stream: d }
        }
      }));
    }
  }
  let dataset_hash = toHashedObject(datasets, 'name', true);
  let tick_hash = toHashedObject(tickDefs, 'name', true);
  if (!config) {
    config = {};
    Object.assign(config, spec.config);
    normalizeScaleConsistency(config, unique(used_encodings));
    delete config.overlayScaleConsistency;
    delete config.forceOverlayScaleConsistency;
  }
  return {
    normalized: streams,
    datasets: dataset_hash,
    tick: tick_hash,
    scaleDefinitions: scales,
    sequenceConfig: config,
    synths,
    samplings,
    waves
  };
}

export function isRepeatedStream(spec) {
  if (spec && spec.encoding && spec.encoding?.repeat) {
    return true;
  }
  return false;
}

function isSingleStream(spec) {
  if (spec && spec.encoding && spec.tone && !spec.overlay && !spec.sequence) {
    return true;
  }
  return false;
}

function isOverlayStream(spec) {
  if (spec && !spec.encoding && !spec.tone && spec.overlay && !spec.sequence) {
    return true;
  }
  return false;
}

function isSequenceStream(spec) {
  if (spec && !spec.encoding && !spec.tone && !spec.overlay && spec.sequence) {
    return true;
  }
  return false;
}

export const bin_ending = "__bin", bin_end_ending = "__bin_end", count_ending = "__count", Def_tone = "default", Auto = "auto";

function normalizeSingleSpec(spec, parent) {
  let scaleDefinitions = [];
  if (!spec) return null;
  let is_part_of_overlay = parent === OVERLAY;
  let normalized = {};
  if (spec.title) {
    normalized.title = spec.title;
  }
  if (spec.name) {
    normalized.name = spec.name;
  }
  normalized.id = 'stream-' + genRid();
  if (spec.description) {
    normalized.description = spec.description;
  }
  // data
  if (spec.data) {
    normalized.data = deepcopy(spec.data);
  }
  // tone
  if (spec.tone) {
    normalized.tone = {};
    if (jType(spec.tone) === "String") {
      normalized.tone.type = spec.tone;
    } else if (jType(spec.tone) === "Object") {
      normalized.tone = deepcopy(spec.tone);
      // do anything if needed
      if (normalized.tone.type === undefined) {
        normalized.tone.type = Def_tone;
      }
    }
    if (jType(spec.tone?.filter) === "Array") {
      normalized.filter = [...spec.tone.filter];
    }
  }
  // encoding
  let further_transforms = [];
  let encoding_aggregates = [];
  if (spec.encoding) {
    normalized.encoding = {};
    if (spec.encoding[TIME_chn]?.scale?.timing === SIM_TIMING) {
      if (spec.encoding[SPEECH_BEFORE_chn] && spec.encoding[SPEECH_AFTER_chn]) {
        console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} and ${SPEECH_AFTER_chn} are dropped.`);
        delete spec.encoding[SPEECH_BEFORE_chn];
        delete spec.encoding[SPEECH_AFTER_chn];
      } else if (spec.encoding[SPEECH_BEFORE_chn]) {
        console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_BEFORE_chn} is dropped.`);
        delete spec.encoding[SPEECH_BEFORE_chn];
      } else if (spec.encoding[SPEECH_AFTER_chn]) {
        console.warn(`Speech channels cannot be used for simultaneous timing. ${SPEECH_AFTER_chn} is dropped.`);
        delete spec.encoding[SPEECH_AFTER_chn];
      }
    }
    let has_repeated_overlay = false;
    for (const channel of Object.keys(spec.encoding)) {
      let o_enc = spec.encoding[channel], enc = {};
      if (o_enc.field) enc.field = o_enc.field;
      if (o_enc.type) enc.type = o_enc.type;
      if (o_enc.by) {
        if (jType(o_enc.by) === 'Array' && !o_enc.by.join('X').match(/(^(sequence|sequenceX)*(overlay|overlayX)*$)/gi)) {
          console.error("Wrong repeat-by form. Overlay cannot preceed sequence!");
        }
        enc.by = o_enc.by;
        has_repeated_overlay = enc.by.includes(OVERLAY)
        if (has_repeated_overlay && is_part_of_overlay) {
          console.error("Overlay composition + overlay repet is not supported.")
        }
      };
      if (o_enc.ramp && RampMethods.includes(o_enc.ramp)) {
        if (o_enc.ramp.constructor.name === 'String') enc.ramp = o_enc.ramp;
        else enc.ramp = o_enc.ramp ? 'linear' : 'exponential';
      } else {
        enc.ramp = 'linear'
      }
      if (o_enc.speech) enc.speech = o_enc.speech;
      if (o_enc.value !== undefined) enc.value = o_enc.value;
      if (channel === TIME_chn && o_enc.tick) enc.tick = deepcopy(o_enc.tick);
      if (o_enc.scale) {
        enc.scale = deepcopy(o_enc.scale);
      } else {
        enc.scale = {};
      }
      if (o_enc.format) enc.format = o_enc.format;
      if (o_enc.formatType) enc.formatType = o_enc.formatType;
      if (o_enc.bin) {
        if (jType(o_enc.bin) === "Object") {
          further_transforms.push({
            bin: o_enc.field,
            step: o_enc.bin.step,
            maxbins: o_enc.bin.maxbins,
            nice: o_enc.bin.nice,
            as: o_enc.field + bin_ending,
            exact: o_enc.bin.exact,
            end: o_enc.field + bin_end_ending
          });
        } else if (jType(o_enc.bin) === "Boolean") {
          further_transforms.push({
            bin: o_enc.field,
            auto: true,
            as: o_enc.field + bin_ending,
            end: o_enc.field + bin_end_ending
          });
        }
        enc.field = o_enc.field + bin_ending;
        enc.original_field = o_enc.field;
        enc.type = QUANT;
        if (channel === TIME_chn) {
          normalized.encoding[channel + "2"] = {
            field: o_enc.field + bin_end_ending,
          };
        }
        if (!enc.scale) enc.scale = {};
        enc.scale.title = o_enc.field + " (binned)";
        enc.binned = true;
      }
      if (o_enc.aggregate) {
        if (!o_enc.field && o_enc.aggregate === "count") {
          encoding_aggregates.push({
            op: "count",
            as: count_ending
          });
          enc.field = count_ending;
          if (!enc.scale) enc.scale = {};
          enc.scale.title = "Count";
          enc.type = QUANT;
        } else {
          encoding_aggregates.push({
            op: o_enc.aggregate,
            field: o_enc.field,
            as: o_enc.field + "__" + o_enc.aggregate,
            p: o_enc.p
          });
          enc.field = o_enc.field + "__" + o_enc.aggregate;
          enc.original_field = o_enc.field;
          if (!enc.scale) enc.scale = {};
          enc.scale.title = o_enc.aggregate + " " + o_enc.field;
          enc.type = o_enc.type || QUANT;
        }
        enc.aggregate = o_enc.aggregate;
      }
      if (o_enc.condition) {
        enc.condtion = deepcopy(o_enc.condition);
      }
      if (channel === TAPCNT_chn && spec.encoding[TAPSPD_chn]) {
        enc.hasTapSpeed = true;
      } else if (channel === TAPSPD_chn && spec.encoding[TAPCNT_chn]) {
        enc.hasTapCount = true;
      }
      // add to a scale 
      let scaleId = 'scale-' + genRid();
      let scaleDef = {
        id: scaleId,
        channel,
        type: enc.type,
        dataName: normalized.data.name,
        field: [enc.field],
        scale: deepcopy(enc.scale),
        streamID: [normalized.id],
        parentType: parent,
      };
      enc.scale.id = scaleId;
      scaleDefinitions.push(scaleDef);
      normalized.encoding[channel] = enc;
    }
    if (normalized.encoding[TIME2_chn]) {
      normalized.encoding[TIME2_chn].scale = { id: normalized.encoding[TIME_chn]?.scale?.id };
      scaleDefinitions.forEach((d) => {
        if (d.channel === TIME_chn && d.id === normalized.encoding[TIME_chn]?.scale?.id) {
          if (!d.hasTime2) d.hasTime2 = [];
          d.hasTime2.push(normalized.id);
        }
      })
    }
    if (normalized.encoding[REPEAT_chn]) {
      scaleDefinitions.forEach((d) => {
        if (!d.isRepeated) d.isRepeated = [];
        d.isRepeated.push(normalized.id);
      });
    }
    let used_channels = Object.keys(normalized.encoding);
    if (has_repeated_overlay || is_part_of_overlay) {
      if (used_channels.includes(SPEECH_AFTER_chn) || used_channels.includes(SPEECH_BEFORE_chn)) {
        console.warn("Using speechAfter/Before channels for an overlaid stream is not recommended.");
      }
    }
  }
  // transform
  if (spec.common_transform) {
    normalized.common_transform = deepcopy(spec.common_transform)
  }
  if (spec.transform) {
    normalized.transform = deepcopy(spec.transform)
  }
  if (further_transforms.length > 0) {
    if (!normalized.transform) normalized.transform = [];
    normalized.transform.push(...further_transforms);
  }
  if (encoding_aggregates.length > 0) {
    normalized.encoding_aggregates = encoding_aggregates;
    if (!normalized.transform) normalized.transform = [];
    normalized.transform.push({ aggregate: encoding_aggregates, groupby: Auto })
  }
  // config
  if (spec.config) {
    let config = {};
    Object.assign(config, spec.config);
    normalized.config = config;

  }
  return { normalized, scaleDefinitions };
}

function normalizeScaleConsistency(config, used_channels) {
  let overlayScaleConsistency = {}, forceOverlayScaleConsistency = {}, sequenceScaleConsistency = {}, forceSequenceScaleConsistency = {};
  for (const chn of used_channels) {
    // overlayScaleConsistency
    if (config.overlayScaleConsistency?.[chn] !== undefined) {
      overlayScaleConsistency[chn] = config.overlayScaleConsistency[chn];
    } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
      overlayScaleConsistency[chn] = config.overlayScaleConsistency;
    } else {
      overlayScaleConsistency[chn] = true;
    }
    // forceOverlayScaleConsistency
    if (config.forceOverlayScaleConsistency?.[chn] !== undefined) {
      forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency[chn];
    } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
      forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency;
    } else {
      forceOverlayScaleConsistency[chn] = false;
    }
    // sequenceScaleConsistency
    if (config.sequenceScaleConsistency?.[chn] !== undefined) {
      sequenceScaleConsistency[chn] = config.sequenceScaleConsistency[chn];
    } else if (jType(config.sequenceScaleConsistency) === 'Boolean') {
      sequenceScaleConsistency[chn] = config.sequenceScaleConsistency;
    } else {
      sequenceScaleConsistency[chn] = true;
    }
    // forceOverlayScaleConsistency
    if (config.forceSequenceScaleConsistency?.[chn] !== undefined) {
      forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency[chn];
    } else if (jType(config.overlayScaleConsistency) === 'Boolean') {
      forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency;
    } else {
      forceSequenceScaleConsistency[chn] = false;
    }
  }
  config.overlayScaleConsistency = overlayScaleConsistency;
  config.forceOverlayScaleConsistency = forceOverlayScaleConsistency;
  config.sequenceScaleConsistency = sequenceScaleConsistency;
  config.forceSequenceScaleConsistency = forceSequenceScaleConsistency;
}