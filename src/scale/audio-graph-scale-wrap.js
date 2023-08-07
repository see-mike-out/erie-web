import { roundToNoteScale } from "../player/audio-graph-instrument-sample";
import { makeTapPattern } from "../util/audio-graph-scale-util";
import { jType, detectType } from "../util/audio-graph-typing-util";
import { round } from "../util/audio-graph-util";
import { DEF_TAP_PAUSE_RATE, MAX_TAPPING_DUR, NOM, ORD, PITCH_chn, POS, QUANT, SINGLE_TAP_MIDDLE, STATIC, SpeechChannels, TAPCNT_chn, TAPSPD_chn, TMP, TapChannels, TimeChannels } from "./audio-graph-scale-constant";
import { makeNominalScaleFunction } from "./audio-graph-scale-nom";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { makeQuantitativeScaleFunction } from "./audio-graph-scale-quant";
import { makeSpeechChannelScale } from "./audio-graph-scale-speech";
import { makeStaticScaleFunction } from "./audio-graph-scale-static";
import { makeTemporalScaleFunction } from "./audio-graph-scale-temp";
import { makeTimeChannelScale } from "./audio-graph-scale-time";

export function getAudioScales(channel, encoding, values, toneSpec) {
  // extract default information
  let polarity = encoding.scale?.polarity || POS;
  let maxDistinct = encoding.scale?.maxDistinct;
  if (maxDistinct === undefined) maxDistinct = true;
  let times = encoding.scale?.times;
  let zero = encoding.scale?.zero !== undefined ? encoding.scale?.zero : false;
  let domainMax, domainMin;
  if (jType(channel) !== "Array") {
    domainMax = Math.max(...values);
    domainMin = Math.min(...values);
  } else {
    domainMax = Math.max(Math.max(...values[0]), Math.max(...values[1]));
    domainMin = Math.min(Math.min(...values[0]), Math.min(...values[1]));
  }
  let nice = encoding.scale?.nice;
  let info = { polarity, maxDistinct, times, zero, domainMax, domainMin, nice };
  // outcome scale function
  let _scale;
  let scaleType = getScaleType(channel, encoding, values);

  // get scale functions
  if (scaleType.isTime) {
    // time scales
    _scale = makeTimeChannelScale(channel, encoding, values, info, scaleType);
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
        scale = (d) => {
          // get a tap pattern
          return makeTapPattern(
            _scale(d),
            TAPCNT_chn,
            encoding.scale?.band, // tapping length
            pause,
            undefined
          );
        }
      } else if (channel === TAPSPD_chn) {
        let tapSpeedValues = values.map((d) => _scale(d));
        let maxTapSpeed = round(Math.max(...tapSpeedValues) * encoding.scale?.band, 0);
        let tappingUnit = encoding.scale?.band / (maxTapSpeed + (maxTapSpeed - 1) * (pause.rate !== undefined ? pause.rate : DEF_TAP_PAUSE_RATE));
        let maxTappingLength = encoding.scale?.maxTappingLength !== undefined ? encoding.scale?.maxTappingLength : MAX_TAPPING_DUR
        if (tappingUnit > maxTappingLength) tappingUnit = maxTappingLength;
        tappingUnit = round(tappingUnit, -2);
        scale = (d) => {
          // get a tap pattern
          return makeTapPattern(
            _scale(d),
            TAPSPD_chn,
            encoding.scale?.band, // total duration
            undefined, // can't use pauseLength
            tappingUnit,
            encoding.scale?.singleTappingPosition || SINGLE_TAP_MIDDLE
          );
        }
      }
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
    if (encoding.scale?.description) {
      scale.properties.descriptionDetail = encoding.scale?.description;
    }
    if (encoding.scale?.playAllDescription) {
      scale.properties.playAllDescription = encoding.scale?.playAllDescription;
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
    encodingType = detectType(values);
  }
  let field = encoding.original_field || encoding.field;
  let binned = encoding.binned;
  let aggregate = encoding.aggregate;
  return { isTime, isSpeech, encodingType, field, binned, aggregate };
}
