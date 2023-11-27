import { scaleLinear } from "d3";
import { TextType, ToneSeries, ToneType } from "../player/audio-graph-player";
import { listString } from "../util/audio-graph-format-util";
import { DEF_LEGEND_DUR, DEF_SPEECH_RATE, NOM, ORD, QUANT, SKIP, NONSKIP, STATIC, TIME_chn, TMP, TapChannels } from "./audio-graph-scale-constant";
import { jType } from "../util/audio-graph-typing-util";
import { unique } from "../util/audio-graph-util";
import { compileDescriptionMarkup } from "./audio-graph-scale-desc-parser";

export function makeScaleDescription(scale, encoding, dataInfo, tickDef, tone_spec, config, beat) {
  let properties = scale.properties;
  let channel = properties.channel, field = properties.field, encodingType = properties.encodingType;
  let timeUnit = config?.timeUnit?.unit || 'seconds';

  if (properties?.descriptionDetail === SKIP || properties?.descriptionDetail === null) {
    return null;
  }

  let expression = '', customExpression = false;

  if (jType(properties?.descriptionDetail) === 'String' && properties?.descriptionDetail !== NONSKIP) {
    expression = properties?.descriptionDetail;
    customExpression = true;
    return [{
      type: TextType, speech: properties?.descriptionDetail, speechRate
    }]
  }

  let speechRate = config.speechRate || DEF_SPEECH_RATE;
  let title = encoding?.scale.title || listString(unique(properties.field), ", ", false);

  if (channel === TIME_chn) {
    if (!customExpression) expression = `The <title> is mapped to <channel>. `;
    let length = properties.range ? Math.max(...properties.range) : null;
    if (length) {
      if (!customExpression) expression += `The duration of the stream is <range.length> <timeUnit>. `
    }
    if (properties.binned) {
      let binInfo = encoding.binned;
      if (binInfo.equiBin) {
        if (!customExpression) expression += `Each sound represents a equally sized bin bucket. `
      } else {
        if (!customExpression) expression += `The length of each sound represents the corresponding bin bucket size. `
      }
    }
    if (tickDef?.interval && tickDef?.description !== SKIP) {
      if (!customExpression) expression += `A tick sound is played every ${tickDef.interval} ${timeUnit}. `
    }
  } else {
    if (encodingType === QUANT) {
      if (title && properties.aggregate && properties.aggregate !== 'count') {
        if (!customExpression) expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
      } else if (properties.aggregate === 'count') {
        if (!customExpression) expression = `The count of data points is mapped to <channel>. `;
      } else {
        if (!customExpression) expression = `The <title> is mapped to <channel>. `;
      }
      if (tone_spec.continued) {
        if (properties?.domain?.length == 2) {
          if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">`;
        } else if (properties?.domain?.length > 2) {
          if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound ${properties.domain.map((_, i) => 'domain[' + i + ']')} duration="${properties.domain * 0.3}">`;
        }
      } else {
        if (properties?.domain?.length == 2) {
          if (!customExpression) expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.3">, and `;
          if (!customExpression) expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.3">.`;
        } else if (properties?.domain?.length > 2) {
          if (!customExpression) {
            expression += `<title> values are mapped as`
            for (let i = 0; i < properties.domain.length; i++) {
              expression += `<domain[${i}]> <sound value="domain[${i}]" duration="0.3">`;
            }
          }
        }
      }
    } else if (encodingType === TMP) {
      if (title && properties.aggregate && properties.aggregate !== 'count') {
        if (!customExpression) expression += `The <title> is mapped to <channel> and aggregated by <aggregate>. `;
      } else if (properties.aggregate === 'count') {
        if (!customExpression) expression += `The count of data points is mapped to <channel>. `;
      } else {
        if (!customExpression) expression += `The <title> is mapped to <channel>. `;
      }
      if (tone_spec.continued) {
        if (!customExpression) expression += `The domains values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.6">. `;
      } else {
        if (!customExpression) expression += `The minimum value <domain.min> is mapped to <sound value="domain.min" duration="0.5">, and `;
        if (!customExpression) expression += `the maximum value <domain.max> is mapped to <sound value="domain.max" duration="0.5">. `;
      }
    } else if (encodingType === ORD || encodingType === NOM) {
      if (!customExpression) expression += `The <title> is mapped to <channel>. `;
      let domainCount = properties.domain.length;
      if (domainCount <= 6 || properties.playAllDescription) {
        for (let i = 0; i < domainCount; i++) {
          if (!customExpression) expression += `The value <domain[${i}]> is <sound value="domain[${i}]" duration="0.3">. `;
        }
      } else {
        if (!customExpression) expression += `The first value <domain[${0}]> is <sound value="domain[${0}]" duration="0.3">. `;
        if (!customExpression) expression += `The second value <domain[${1}]> is <sound value="domain[${1}]" duration="0.3">. `;
        if (!customExpression) expression += `The second last value <domain[${domainCount - 2}]> is <sound value="domain[${domainCount - 2}]" duration="0.3">. `;
        if (!customExpression) expression += `The last value <domain[${domainCount - 1}]> is <sound value="domain[${domainCount - 1}]" duration="0.3">. `;
      }
    } else if (encodingType === STATIC) {
      if (properties.conditions) {
        for (const cond of properties.conditions) {
          if (jType(cond.test) === 'Array') {
            if (!customExpression) expression += `The values of <list item="${cond.test.join(',')}" join=", "> are mapped to <sound value="${cond.test[0]}" duration="0.3>. `;
          } else if (cond.test?.not && jType(cond.test.not) === 'Array') {
            if (!customExpression) expression += `The values that are not <list item="${cond.test.not.join(',')}" join=", "> are mapped to <sound value="${cond.test.not[0]}" duration="0.3>. `;
          } else if (cond.test && cond.name) {
            let d = cond.test[0] || cond.test.not?.[0];
            if (!customExpression && d !== undefined) expression += `${cond.name} values are mapped to <sound value="${d}" duration="0.3>. `;
          }
        }
      }
    }
  }

  let parsedExprDesc = compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit);
  let descList = [];
  for (const pDesc of parsedExprDesc) {
    if (pDesc.type === TextType) {
      descList.push({
        type: TextType,
        speech: pDesc.text,
        speechRate: pDesc.speechRate || speechRate
      });
    } else if (pDesc.type === 'sound') {
      if (pDesc.continuous) {
        let sounds = makeConinuousAudioLegend(channel, pDesc.value, scale, pDesc.duration);
        descList.push({
          type: ToneSeries, channel, sounds, instrument_type: tone_spec?.type || "default", continued: true
        });
      } else {
        let sound = makeSingleDiscAudioLegend(channel, pDesc.value, scale, pDesc.duration);
        descList.push({
          type: ToneType,
          sound,
          instrument_type: tone_spec?.type || "default"
        });
      }
    }
  }
  return descList;
}

function makeConinuousAudioLegend(channel, domain, scale, duration) {
  let min = Math.min(...domain), max = Math.max(...domain);
  let normalizer = (d) => (d - min) / (max - min) * duration;

  let timing = scaleLinear().domain(domain).range(domain.map(normalizer));
  let sounds = [];
  let i = 0;
  for (const d of domain) {
    sounds.push({
      start: timing(d),
      [channel]: scale(d),
      duration: (i == domain.length - 1 ? 0.15 : 0)
    });
    i++;
  }
  return sounds;
}

function makeSingleDiscAudioLegend(channel, value, scale, duration) {
  let sound = {
    start: 0,
    [channel]: scale(value),
  };
  if (sound.duration == undefined) {
    sound.duration = duration || 0.2;
  }

  return sound;
}

export const ForceRepeatScale = 'forceRepeatScale',
  PlayAt = 'playScaleAt',
  BeforeAll = 'beforeAll',
  BeforeThis = 'beforeThis',
  AfterAll = 'afterAll',
  AfterThis = 'afterThis';