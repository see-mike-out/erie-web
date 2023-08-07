import { scaleLinear } from "d3";
import { TextType, ToneSeries, ToneType } from "../player/audio-graph-player";
import { listString } from "../util/audio-graph-format-util";
import { DEF_LEGEND_DUR, DEF_SPEECH_RATE, NOM, ORD, QUANT, SKIP, NONSKIP, STATIC, TIME_chn, TMP, TapChannels } from "./audio-graph-scale-constant";
import { jType } from "../util/audio-graph-typing-util";
import { unique } from "../util/audio-graph-util";

export function makeScaleDescription(scale, encoding, dataInfo, tickDef, tone_spec, config) {
  let properties = scale.properties;
  if (properties?.descriptionDetail === SKIP || properties?.descriptionDetail === null) {
    return null;
  }
  if (jType(properties?.descriptionDetail) === 'String' && properties?.descriptionDetail !== NONSKIP) {
    return [{
      type: TextType, speech: properties?.descriptionDetail, speechRate
    }]
  }
  let descriptions = [];
  let channel = properties.channel, field = properties.field, encodingType = properties.encodingType;
  let speechRate = config.speechRate || DEF_SPEECH_RATE;
  let title = encoding?.scale.title || listString(unique(properties.field), ", ", true);

  if (channel === TIME_chn) {
    if (title) {
      descriptions.push({
        type: TextType, speech: `The ${title} variable is mapped to ${channel}. `, speechRate
      });
    }
    let length = properties.range ? Math.max(...properties.range) : null;
    if (length) {
      descriptions.push({
        type: TextType,
        speech: `The duration of each stream is ${length} seconds. `,
        speechRate
      });
    }
    if (properties.binned) {
      let binInfo = encoding.binned;
      if (binInfo.equiBin) {
        descriptions.push({
          type: TextType, speech: `Each sound represents a equally sized bin bucket. `, speechRate
        });
      } else {
        descriptions.push({
          type: TextType, speech: `The length of each sound represents the corresponding bin bucket size. `, speechRate
        });
      }
    }
    if (tickDef?.interval && tickDef?.description !== SKIP) {
      descriptions.push({
        type: TextType, speech: `A tick sound is played every ${tickDef.interval} seconds. `, speechRate,
        isTick: true
      });
    }
  } else {
    if (encodingType === QUANT) {
      if (title && properties.aggregate && properties.aggregate !== 'count') {
        descriptions.push({
          type: TextType, speech: `The ${title} variable is mapped to ${channel}, aggregated by ${properties.aggregate}. `, speechRate
        });
      } else if (properties.aggregate === 'count') {
        descriptions.push({
          type: TextType, speech: `The counts of data points are mapped to ${channel}. `, speechRate
        });
      } else {
        descriptions.push({
          type: TextType, speech: `The ${title} variable is mapped to ${channel}. `, speechRate
        });
      }
      descriptions.push({
        type: TextType,
        speech: `The domain values from ${listString(properties.domain, ', ', true, 'to')} are mapped to `,
        speechRate
      });
      if (tone_spec.continued) {
        let sounds = makeConinuousAudioLegend(channel, properties.domain, scale, config.legendLength || DEF_LEGEND_DUR);
        descriptions.push({
          type: ToneSeries, channel, sounds, instrument_type: tone_spec?.type || "default", continued: true
        });
      } else {
        let sounds = makeDiscreteAudioLegend(channel, properties.domain, scale);
        for (const sound of sounds) {
          descriptions.push({
            type: ToneType, channel, sound, instrument_type: tone_spec?.type || "default", continued: false
          });
        }
      }
    } else if (encodingType === TMP) {
      if (title && properties.aggregate && properties.aggregate !== 'count') {
        descriptions.push({
          type: TextType, speech: `The ${title} variable is mapped to ${channel}, aggregated by ${properties.aggregate}. `, speechRate
        });
      } else if (properties.aggregate === 'count') {
        descriptions.push({
          type: TextType, speech: `The counts of data points are mapped to ${channel}. `, speechRate
        });
      } else {
        descriptions.push({
          type: TextType, speech: `The ${title} variable is mapped to ${channel}. `, speechRate
        });
      }
      // timelevel, timeunit;
      descriptions.push({
        type: TextType,
        speech: `The domain values from ${listString(properties.domain, ', ', true, 'to')} are mapped to `,
        speechRate
      });

      if (tone_spec.continued) {
        let sounds = makeConinuousAudioLegend(channel, properties.domain, scale, config.legendLength || DEF_LEGEND_DUR);
        descriptions.push({
          type: ToneSeries, channel, sounds, instrument_type: tone_spec?.type || "default", continued: true
        });
      } else {
        let sounds = makeDiscreteAudioLegend(channel, properties.domain, scale);
        for (const sound of sounds) {
          descriptions.push({
            type: ToneType, channel, sound, instrument_type: tone_spec?.type || "default", continued: false
          });
        }
      }
    } else if (encodingType === ORD || encodingType === NOM) {
      descriptions.push({
        type: TextType, speech: `The counts of data points are mapped to ${channel}. `, speechRate
      });
      let domainCount = properties.domain.length;
      if (domainCount <= 6 || properties.playAllDescription) {
        let sounds = makeDiscreteAudioLegend(channel, properties.domain, scale)
        for (let i = 0; i < domainCount; i++) {
          descriptions.push({
            type: TextType,
            speech: `${properties.domain[i]} is `,
            speechRate
          });
          descriptions.push({
            type: ToneType,
            sound: sounds[i],
            instrument_type: tone_spec?.type || "default"
          });
        }
      } else {
        let firstTwo = properties.domain.slice(0, 2),
          lastTwo = properties.domain.slice(domainCount - 2, domainCount);
        descriptions.push({
          type: TextType,
          speech: `The first two values are  ${listString(firstTwo, ', ', true, 'and')} and they are mapped to `,
          speechRate
        });
        let sounds1 = makeDiscreteAudioLegend(channel, firstTwo, scale)
        for (let i = 0; i < 2; i++) {
          descriptions.push({
            type: ToneType,
            sound: sounds1[i],
            instrument_type: tone_spec?.type || "default"
          });
        }
        descriptions.push({
          type: TextType,
          speech: `The last two values are  ${listString(lastTwo, ', ', true, 'and')} and they are mapped to `,
          speechRate
        });
        let sounds2 = makeDiscreteAudioLegend(channel, lastTwo, scale)
        for (let i = 0; i < 2; i++) {
          descriptions.push({
            type: ToneType,
            sound: sounds2[i],
            instrument_type: tone_spec?.type || "default"
          });
        }
      }
    } else if (encodingType === STATIC) {
      if (properties.conditions) {
        for (const cond of properties.conditions) {
          if (jType(cond.test) === 'Array') {
            descriptions.push({
              type: TextType,
              speech: `${listString(cond.test, ', ', true, 'and')} values are mapped to `,
              speechRate
            });
            let sound = makeSingleLegendSound(channel, cond.value)
            descriptions.push({
              type: ToneType,
              sound,
              instrument_type: tone_spec?.type || "default"
            });
          } else if (cond.test?.not && jType(cond.test.not) === 'Array') {
            descriptions.push({
              type: TextType,
              speech: `Values not belonging to ${listString(cond.test.not, ', ', true, 'and')} are mapped to `,
              speechRate
            });
            let sound = makeSingleLegendSound(channel, cond.value)
            descriptions.push({
              type: ToneType,
              sound,
              instrument_type: tone_spec?.type || "default"
            });
          } else if (cond.test && cond.name) {
            descriptions.push({
              type: TextType,
              speech: `${cond.name} values are mapped to `,
              speechRate
            });
            let sound = makeSingleLegendSound(channel, cond.value)
            descriptions.push({
              type: ToneType,
              sound,
              instrument_type: tone_spec?.type || "default"
            });
          }
        }
      }
    }
  }
  return descriptions;
}

function makeConinuousAudioLegend(channel, domain, scale, duration) {
  let min = Math.min(...domain), max = Math.max(...domain);
  let normalizer = (d) => (d - min) / (max - min) * duration;

  let timing = scaleLinear().domain(domain).range(domain.map(normalizer));
  let sounds = [];
  for (const d of domain) {
    sounds.push({
      start: timing(d),
      [channel]: scale(d),
      duration: 0
    });
  }
  return sounds;
}

function makeDiscreteAudioLegend(channel, domain, scale) {
  let sounds = [];
  for (const d of domain) {
    let sound = {
      start: 0,
      [channel]: scale(d),
    };
    if (sound.duration == undefined) sound.duration = 0.2;
    if (TapChannels.includes(channel)) {
      sound.tap = sound[channel];
      sound.duration = sound.tap.totalLength;
      delete sound[channel];
    }
    sounds.push(sound);
  }
  return sounds;
}

function makeSingleLegendSound(channel, value) {
  let sound = {
    start: 0,
    [channel]: value,
  }
  if (sound.duration == undefined) sound.duration = 0.2;
  if (TapChannels.includes(channel)) {
    sound.tap = sound[channel];
    sound.duration = sound.tap.totalLength;
    delete sound[channel];
  }
  return sound;
}