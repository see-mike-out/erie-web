import {
  OVERLAY,
  QUANT,
  SIM,
  RampMethods,
  REPEAT_chn,
  SPEECH_AFTER_chn,
  SPEECH_BEFORE_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  TIME2_chn,
  TIME_chn,
  PITCH_chn,
  SEQUENCE,
  NormalizedSingleStream,
  NormalizedTone,
  NormalizedEncoding,
  NormalizedEncodingItem,
  RampLinear,
  TransformItem,
  AggregateItem,
  RampType,
  ScaleType,
  FormatType,
  InlineBinType,
  ZeroOPs,
  AggOpType,
  Condition,
  ParsedScaleDefinition,
  EncodingType,
  ExtendedSingleSpec,
  TransformList,
  Auto,
  ConfigInterface,
  DataSpec3,
  RampAbrupt
} from "../types";
import {
  deepcopy,
  genRid
} from "../util";


export const bin_ending = "__bin", bin_end_ending = "__bin_end", count_ending = "__count", Def_tone = "default";

export function normalizeSingleSpec(
  spec: ExtendedSingleSpec,
  parent: typeof OVERLAY | typeof SEQUENCE | null
): {
  normalized: NormalizedSingleStream | null,
  scaleDefinitions: ParsedScaleDefinition[] | null
} {
  if (!spec) return { normalized: null, scaleDefinitions: null };

  let scaleDefinitions: ParsedScaleDefinition[] = [];
  let is_part_of_overlay = parent === OVERLAY;

  let title = spec.title,
    name = spec.name,
    id = 'stream-' + genRid(),
    description = spec.description,
    data = deepcopy(spec.data) as DataSpec3;

  let tone: NormalizedTone;
  // tone
  if (typeof spec.tone === "string") {
    tone = { type: spec.tone };
  } else if (spec.tone instanceof Object) {
    tone = deepcopy(spec.tone);
  } else {
    tone = { type: Def_tone };
  }
  // do anything if needed
  if (tone.type === undefined) {
    tone.type = Def_tone;
  }
  let filter: string[] | undefined = undefined;
  if (spec.tone && ('filter' in spec.tone) && spec.tone.filter instanceof Array) {
    filter = [...spec.tone.filter];
  }
  // encoding
  let further_transforms: TransformItem[] = [];
  let encoding_aggregates: AggregateItem[] = [];
  let encoding: NormalizedEncoding = {};
  if (spec.encoding[TIME_chn]?.scale?.timing === SIM) {
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
    let o_enc = spec.encoding[channel];
    let _field = o_enc.field ?? undefined;
    let _original_field: string | undefined = undefined;
    let _type = o_enc.type ?? undefined;
    let _by: string[] | undefined = undefined;
    if (channel !== REPEAT_chn && _field instanceof Array) {
      console.error("Only a repeat channel can have an array of fields.");
    }
    if ((o_enc.bin || o_enc.aggregate) && _field instanceof Array) {
      console.error("An aggregated/binned channel can't have an array of fields.");
    }
    if (o_enc.by) {
      if (o_enc.by instanceof Array
        && !o_enc.by.join('X').match(/(^(sequence|sequenceX)*(overlay|overlayX)*$)/gi)) {
        console.error("Wrong repeat-by form. Overlay cannot preceed sequence!");
      }
      if (o_enc.by instanceof Array) _by = o_enc.by;
      else if (typeof o_enc.by === 'string') _by = [o_enc.by];
      if (_by instanceof Array) {
        has_repeated_overlay = _by.includes(OVERLAY)
      }
      if (has_repeated_overlay && is_part_of_overlay) {
        console.error("Overlay composition + overlay repeat is not supported.")
      }
    };
    let _ramp: RampType | undefined = undefined;
    if (o_enc.ramp && RampMethods.includes(o_enc.ramp)) {
      if (typeof o_enc.ramp === 'string') _ramp = o_enc.ramp;
      else _ramp = o_enc.ramp ? RampLinear : RampAbrupt;
    } else {
      _ramp = 'linear'
    }
    let _speech = o_enc.speech ?? undefined;
    let _value = o_enc.value ?? undefined;
    let _tick = (channel === TIME_chn && o_enc.tick) ? deepcopy(o_enc.tick) : undefined;
    let _scale: ScaleType = o_enc.scale ? deepcopy(o_enc.scale) : {};
    let _format: string | undefined = o_enc.format ?? undefined;
    let _formatType: FormatType | undefined = o_enc.formatType ?? undefined;
    let _bin: InlineBinType | undefined, _binned: boolean;
    if (o_enc.bin) {
      if (!o_enc.field) {
        console.error("Bin without a field name is not possible.")
      }
      if (o_enc.bin instanceof Object) {
        further_transforms.push({
          bin: o_enc.field as string,
          step: 'step' in o_enc.bin ? o_enc.bin.step : undefined,
          maxbins: 'maxbins' in o_enc.bin ? o_enc.bin.maxbins : undefined,
          nice: 'nice' in o_enc.bin ? o_enc.bin.nice : undefined,
          as: o_enc.field + bin_ending,
          exact: 'exact' in o_enc.bin ? o_enc.bin.exact : undefined,
          end: o_enc.field + bin_end_ending
        } as TransformItem);
      } else if (typeof o_enc.bin === "boolean") {
        further_transforms.push({
          bin: o_enc.field as string,
          auto: true,
          as: o_enc.field + bin_ending,
          end: o_enc.field + bin_end_ending
        } as TransformItem);
      }
      _field = o_enc.field + bin_ending;
      _original_field = o_enc.field as string;
      _type = QUANT;
      if (channel === TIME_chn) {
        encoding[channel + "2"] = {
          field: o_enc.field + bin_end_ending,
        } as NormalizedEncodingItem;
      }
      if (!_scale) _scale = {};
      _scale.title = o_enc.field + " (binned)";
      _binned = true;
    } else {
      _binned = false;
    }
    let _aggregate: AggOpType | undefined = undefined;
    if (o_enc.aggregate) {
      if (!o_enc.field && ZeroOPs.includes(o_enc.aggregate)) {
        encoding_aggregates.push({
          op: "count",
          as: count_ending
        });
        _field = count_ending;
        if (!_scale) _scale = {};
        _scale.title = "Count";
        _type = QUANT;
      } else {
        encoding_aggregates.push({
          op: o_enc.aggregate,
          field: o_enc.field,
          as: o_enc.field + "__" + o_enc.aggregate,
          p: o_enc.p
        });
        _field = o_enc.field + "__" + o_enc.aggregate;
        _original_field = o_enc.field as string;
        if (!_scale) _scale = {};
        _scale.title = o_enc.aggregate + " " + o_enc.field;
        _type = o_enc.type || QUANT;
      }
      _aggregate = o_enc.aggregate;
    }
    let _condition: Condition | undefined = o_enc.condition ? deepcopy(o_enc.condition) : undefined;
    let _hasTapSpeed: boolean | undefined = undefined,
      _hasTapCount: boolean | undefined = undefined,
      _roundToNote: boolean | undefined = undefined;

    // to indicate whether tap count and speed channels are specified with each other
    // in case of which, it should be considered in computing the tap function
    if (channel === TAPCNT_chn && spec.encoding[TAPSPD_chn]) {
      _hasTapSpeed = true;
    } else if (channel === TAPCNT_chn && !spec.encoding[TAPSPD_chn]) {
      _hasTapSpeed = false;
    }
    if (channel === TAPSPD_chn && spec.encoding[TAPCNT_chn]) {
      _hasTapCount = true;
    } else if (channel === TAPSPD_chn && !spec.encoding[TAPCNT_chn]) {
      _hasTapCount = false;
    }
    if (channel === PITCH_chn && o_enc.roundToNote) {
      _roundToNote = true;
    } else if (channel === PITCH_chn && !o_enc.roundToNote) {
      _roundToNote = false;
    }
    // add to a scale 
    let scaleId = 'scale-' + genRid();
    let scaleDef: ParsedScaleDefinition = {
      id: scaleId,
      channel,
      type: _type as EncodingType,
      dataName: data.name,
      field: _field ? (_field instanceof Array ? _field : [_field]) : [],
      scale: deepcopy(_scale),
      streamID: [id],
      parentType: parent,
      condition: _condition,
      sort: o_enc.sort,
      timeUnit: o_enc.timeUnit
    };
    if (_roundToNote) {
      scaleDef.roundToNote = true;
    }
    _scale.id = scaleId;
    scaleDefinitions.push(scaleDef);
    encoding[channel] = {
      field: _field,
      original_field: _original_field,
      type: _type,
      ramp: _ramp,
      aggregate: _aggregate,
      bin: _bin,
      binned: _binned,
      condition: _condition,
      value: _value,
      scale: _scale,
      format: _format,
      formatType: _formatType,
      speech: _speech,
      tick: _tick,
      roundToNote: _roundToNote,
      hasTapSpeed: _hasTapSpeed,
      hasTapCount: _hasTapCount,
      by: _by,
      sort: o_enc.sort,
      timeUnit: o_enc.timeUnit,
      timeUnitName: o_enc.timeUnitName,
      timeLevel: o_enc.timeLevel
    } as NormalizedEncodingItem;
  }
  // if time2 channel is defined, set the scale for it
  if (encoding[TIME2_chn]) {
    encoding[TIME2_chn].scale = { id: encoding[TIME_chn]?.scale?.id };
    scaleDefinitions.forEach((d) => {
      if (d.channel === TIME_chn && d.id === encoding[TIME_chn]?.scale?.id) {
        if (!d.hasTime2) d.hasTime2 = [];
        d.hasTime2.push(id);
      }
    })
  }
  // mark repeat channel in the scale definition
  if (encoding[REPEAT_chn]) {
    scaleDefinitions.forEach((d) => {
      if (!d.isRepeated) d.isRepeated = [];
      d.isRepeated.push(id);
    });
  }
  // makr used channels
  let used_channels = Object.keys(encoding);
  // warn: overlay + repeat => no...
  if (has_repeated_overlay || is_part_of_overlay) {
    if (used_channels.includes(SPEECH_AFTER_chn) || used_channels.includes(SPEECH_BEFORE_chn)) {
      console.warn("Using speechAfter/Before channels for an overlaid stream is not recommended.");
    }
  }

  // transform
  let common_transform: TransformList | undefined = undefined,
    transform: TransformList | undefined = undefined;
  if (spec.common_transform) {
    common_transform = deepcopy(spec.common_transform)
  }
  if (spec.transform) {
    transform = deepcopy(spec.transform)
  }
  if (further_transforms.length > 0) {
    if (transform == undefined) transform = [];
    transform.push(...further_transforms);
  }
  if (encoding_aggregates.length > 0) {
    if (!transform) transform = [];
    transform.push({ aggregate: encoding_aggregates, groupby: Auto })
  }

  // [todo]  <- future support
  /** if (transform !== undefined && (transform?.length ?? 0) > 0) {
        transform.forEach((t) => {
          if ((t.boxplot || t.quantile) && !t.groupby) t.groupby = Auto;
        });
      } */

  // config
  let config: ConfigInterface | undefined = undefined;
  if (spec.config) {
    config = {};
    Object.assign(config, spec.config);
    config = config;
  }

  let normalized: NormalizedSingleStream = {
    title,
    name,
    id,
    description,
    data,
    tone,
    filter,
    encoding,
    config,
    common_transform,
    transform
  };

  return { normalized, scaleDefinitions };
}