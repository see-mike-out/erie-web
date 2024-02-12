import { asc, unique } from "../util/audio-graph-util";
import { roundToNoteScale } from "../player/audio-graph-instrument-sample";
import { listString } from "../util/audio-graph-format-util";
import { jType, detectType } from "../util/audio-graph-typing-util";
import { round } from "../util/audio-graph-util";
import { DEF_TAPPING_DUR_BEAT, DEF_TAP_DUR, DEF_TAP_DUR_BEAT, DEF_TAP_PAUSE_RATE, DUR_chn, MAX_TAPPING_DUR, NOM, ORD, PITCH_chn, POS, QUANT, SINGLE_TAP_MIDDLE, STATIC, SpeechChannels, TAPCNT_chn, TAPSPD_chn, TMP, TapChannels, TimeChannels } from "./audio-graph-scale-constant";
import { makeNominalScaleFunction } from "./audio-graph-scale-nom";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { makeQuantitativeScaleFunction } from "./audio-graph-scale-quant";
import { makeSpeechChannelScale } from "./audio-graph-scale-speech";
import { makeStaticScaleFunction } from "./audio-graph-scale-static";
import { makeTemporalScaleFunction } from "./audio-graph-scale-temp";
import { makeTimeChannelScale } from "./audio-graph-scale-time";
import { makeFieldedScaleFunction } from "./audio-graph-scale-field";

export function getAudioScales(channel, encoding, values, beat, data) {
  // extract default information
  let polarity = encoding.scale?.polarity || POS;
  let maxDistinct = encoding.scale?.maxDistinct;
  if (maxDistinct === undefined) maxDistinct = true;
  let scaleId = encoding.id;
  let times = encoding.scale?.times;
  let zero = encoding.scale?.zero !== undefined ? encoding.scale?.zero : false;
  let domainMax, domainMin;
  // check on this
  if (jType(channel) !== "Array" && values) {
    let domainSorted = values.toSorted(asc);
    domainMax = domainSorted[domainSorted.length - 1];
    domainMin = domainSorted[0];
  } else if (values) {
    let domainSorted = values[0].concat(values[1]).toSorted(asc);
    domainMax = domainSorted[domainSorted.length - 1];
    domainMin = domainSorted[0];
    // legacy (keep until stable)
    // domainMax = Math.max(Math.max(...values[0]), Math.max(...values[1]));
    // domainMin = Math.min(Math.min(...values[0]), Math.min(...values[1]));
  }

  let nice = encoding.scale?.nice;
  let info = { polarity, maxDistinct, times, zero, domainMax, domainMin, nice };
  // outcome scale function
  let _scale;
  let scaleType = getScaleType(channel, encoding, values);

  // get scale functions
  if (scaleType.fieldRange) {
    _scale = makeFieldedScaleFunction(channel, encoding, values, info, data);
  } else if (scaleType.isTime) {
    // time scales
    _scale = makeTimeChannelScale(channel, encoding, values, info, scaleType, beat);
  } else if (scaleType.isSpeech) {
    _scale = makeSpeechChannelScale(channel, encoding, values, info);
  } else {
    if (scaleType.encodingType === QUANT) {
      _scale = makeQuantitativeScaleFunction(channel, encoding, values, info);
    } else if (scaleType.encodingType === TMP) {
      _scale = makeTemporalScaleFunction(channel, encoding, values, info);
    } else if (scaleType.encodingType === ORD) {
      _scale = makeOrdinalScaleFunction(channel, encoding, values, info);
    } else if (scaleType.encodingType === NOM) {
      _scale = makeNominalScaleFunction(channel, encoding, values, info);
    } else if (scaleType.encodingType === STATIC) {
      _scale = makeStaticScaleFunction(channel, encoding, values, info);
    }
  }
  if (_scale) {
    let scale
    if (channel === PITCH_chn && encoding.roundToNote) {
      scale = (d) => { return roundToNoteScale(_scale(d)); }
    } else if (TapChannels.includes(channel)) {
      let pause = { rate: encoding.scale?.pauseRate !== undefined ? encoding.scale?.pauseRate : DEF_TAP_PAUSE_RATE };
      if (encoding.scale?.pauseLength) pause = { length: encoding.scale?.pauseLength };
      if (channel === TAPCNT_chn) {
        scale = (d) => ({
          value: _scale(d),
          tapLength: encoding.scale?.band,
          pause,
          beat
        });
      } else if (channel === TAPSPD_chn) {
        let tapSpeedValues = values.map((d) => _scale(d));
        let tapBand = encoding.scale?.band || (beat ? DEF_TAP_DUR_BEAT : DEF_TAP_DUR)
        let maxTapSpeed = round(Math.max(...tapSpeedValues) * tapBand, 0);
        let tappingUnit = tapBand / (maxTapSpeed + (maxTapSpeed - 1) * (pause.rate !== undefined ? pause.rate : DEF_TAP_PAUSE_RATE));
        let maxTappingLength = encoding.scale?.maxTappingLength !== undefined ? encoding.scale?.maxTappingLength : (beat ? DEF_TAPPING_DUR_BEAT : MAX_TAPPING_DUR);
        if (tappingUnit > maxTappingLength) tappingUnit = maxTappingLength;
        tappingUnit = round(tappingUnit, -2);
        scale = (d) => ({
          value: _scale(d),
          tapDuration: encoding.scale?.band,
          tappingUnit,
          singleTappingPosition: encoding.scale?.singleTappingPosition || SINGLE_TAP_MIDDLE,
          beat
        });
      }
    } else if (channel === DUR_chn && beat) {
      scale = (d) => beat.converter(_scale(d));
    } else {
      scale = _scale;
    }
    if (scale.properties) {
      Object.assign(scale.properties, scaleType);
    } else if (_scale.properties) {
      scale.properties = {}
      Object.assign(scale.properties, _scale.properties);
      Object.assign(scale.properties, scaleType);
    }
    if (encoding.scale?.description || encoding.scale?.description === undefined) {
      scale.properties.descriptionDetail = encoding.scale?.description;
    } else {
      scale.properties.descriptionDetail = null;
    }
    if (encoding.scale?.title) {
      scale.properties.title = encoding.scale?.title;
    } else {
      scale.properties.title = listString(unique(scale.properties.field), ", ", false);
    }

    if (encoding.format) {
      scale.properties.format = encoding.format;
    }
    if (encoding.formatType) {
      scale.properties.formatType = encoding.formatType;
    } else if (encoding.format) {
      scale.properties.formatType = "number";
    }

    if (scaleId) {
      scale.scaleId = scaleId;
    }
    return scale;
  } else {
    console.error(`The encoding definition for ${channel} channel is illegal:`, encoding);
    return null;
  }
  // add scale description
}

function getScaleType(channel, encoding, values) {
  let isTime = TimeChannels.includes(channel) || TimeChannels.includes(channel[0]);
  let isSpeech = SpeechChannels.includes(channel);
  let encodingType = encoding.type;
  if (!encodingType) {
    if (encoding.value) encodingType = STATIC;
    else encodingType = detectType(values);
  }
  let field = encoding.original_field || encoding.field;
  let binned = encoding.binned;
  let aggregate = encoding.aggregate;
  let fieldRange = encoding.scale?.range?.field || null;
  return { isTime, isSpeech, encodingType, field, binned, aggregate, fieldRange };
}
