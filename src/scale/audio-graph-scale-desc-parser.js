import { format, timeFormat } from "d3";
import { listString } from "../util/audio-graph-format-util";
import { jType } from "../util/audio-graph-typing-util";
import { TIME_chn } from "./audio-graph-scale-constant";

const descriptionKeywords = [
  'sound', 'list', 'domain', 'domain.min', 'domain.max', 'domain.length',
  'channel', 'field', 'aggregate', 'title', 'range.length', 'range', 'timeUnit'
];

export function compileDescriptionMarkup(expression, channel, scale, speechRate, timeUnit) {
  if (expression.length == 0 || !expression) return [];
  let exprParsed = parseDescriptionMarkup(expression);
  let scaleProps = scale.properties;
  let preQueue = [];
  for (const seg of exprParsed) {
    if (seg.type === "text") {
      seg.speechRate = speechRate
      preQueue.push(seg);
    } else {
      if (seg.key === "sound") {
        let item = { type: 'sound' };
        if (jType(seg.value) === "Array") {
          item.continuous = true;
          item.value = seg.value.map((v) => getLKvalues(v, channel, scaleProps, timeUnit));
        } else {
          item.continuous = false;
          item.value = getLKvalues(seg.value, channel, scaleProps, timeUnit);
        }
        if (seg.duration) {
          item.duration = seg.duration;
        } else {
          if (item.continuous) item.duration = (timeUnit === 'beat' ? 1 : 0.5) * item.value.length;
          else item.duration = (timeUnit === 'beat' ? 1 : 0.5);
        }
        preQueue.push(item);
      } else if (seg.key === "list") {
        let elements = seg.item;
        if (!elements) elements = getKeywordValues('domain', channel, scaleProps, timeUnit);
        let formatter = (d) => d;
        if (scaleProps.format) {
          if (scaleProps.formatType === "number") formatter = format(scaleProps.format);
          else if (scaleProps.formatType === "datetime") formatter = timeFormat(scaleProps.format);
        }
        if (elements) elements = elements.map((d) => jType(d) === 'Number' ? formatter(d) : d);

        let first = seg.first;
        let last = seg.last;
        let item = { type: 'text' };
        let textItems = [];
        if (first) textItems.push(...elements.slice(0, first));
        if (last) textItems.push(...elements.slice(elements.length - last, elements.length));
        let join = seg.join || ", ", and = seg.and;
        item.text = listString(textItems, join, and ? true : false, and);
        item.speechRate = speechRate;
        preQueue.push(item);
      } else {
        let text = getKeywordValues(seg.key, channel, scaleProps, timeUnit);
        let formatter = (d) => (d?.toString() || '');
        if (scaleProps.format) {
          if (scaleProps.formatType === "number") formatter = format(scaleProps.format);
          else if (scaleProps.formatType === "datetime") formatter = timeFormat(scaleProps.format);
        }
        if (jType(text) === 'Array') text = text.map((d) => jType(d) === 'Number' ? formatter(d) : d);
        else if (jType(text) !== 'String') text = formatter(text);
        preQueue.push({
          type: 'text',
          text: text,
          speechRate
        });
      }
    }
  }

  // flatten (merging text outputs)
  let queue = [];
  for (const item of preQueue) {
    if (queue.length > 0 && queue[queue.length - 1].type === 'text' && item.type === 'text') {
      queue[queue.length - 1].text += (item.text.startsWith(".") ? "" : " ") + item.text.trim();
    } else {
      queue.push(item);
    }
  }
  return queue;
}

function getLKvalues(item, channel, scaleProps, timeUnit) {
  if (item?.literal) return item.literal;
  else if (item?.keyword) return getKeywordValues(item.keyword, channel, scaleProps, timeUnit);
  else return undefined;
}

function getKeywordValues(keyword, channel, scaleProps, timeUnit) {
  if (keyword === 'domain') {
    return scaleProps.domain.join(", ");
  } else if (keyword === 'domain.min') {
    return Math.min(...scaleProps.domain);
  } else if (keyword === 'domain.max') {
    return Math.max(...scaleProps.domain);
  } else if (keyword.match(/domain\[[0-9]+\]/g)) {
    let i = parseInt(keyword.match(/[0-9]+/g)[0]);
    return scaleProps.domain[i];
  } else if (keyword === 'domain.length') {
    return scaleProps.domain.length;
  } if (keyword === 'range') {
    return scaleProps.range.join(", ");
  } else if (keyword === 'range.length') {
    if (channel === TIME_chn) return scaleProps.length;
    else return Math.max(...scaleProps.range) - Math.min(...scaleProps.range);
  } else if (keyword === 'channel') {
    return channel;
  } else if (keyword === 'field') {
    return scaleProps.field.join(", ");
  } else if (keyword === 'title') {
    return scaleProps.title;
  } else if (keyword === 'aggregate') {
    return scaleProps.aggregate;
  } else if (keyword === 'timeUnit') {
    return timeUnit;
  }
}

const exprRegex = /(\<[^\<\>]+\>|[^\<\>]+)/g;

export function parseDescriptionMarkup(expression) {
  if (jType(expression) !== 'String') {
    console.error("Wrong description expression type.")
  }
  let expr = expression.trim(), hasPeriodAtTheEnd = false;
  if (expr.endsWith(".")) {
    expr = expr.substring(0, expr.length - 1);
    hasPeriodAtTheEnd = true;
  }
  let exprGroups = expr.match(exprRegex);
  if (!exprGroups) {
    console.error(`Wrong description expression (not parsable): ${expression}.`)
  }
  let parsed = [];
  for (const exprSeg of exprGroups) {
    if (exprSeg.startsWith("<")) {
      // sound item or other item should be replaced
      let segParsed = parseDescriptionKeywords(exprSeg);
      parsed.push(segParsed);
    } else {
      // pure text
      parsed.push({
        type: 'text',
        text: exprSeg
      });
    }
  }
  if (parsed[parsed.length - 1].type === "text" && hasPeriodAtTheEnd) {
    parsed[parsed.length - 1].text += ".";
  }
  return parsed;
}

const descSegmentReges = /(([a-zA-Z0-9\.]+=\"[^\"]+\")|[a-zA-Z\.0-9\[\]]+)/g;

function parseDescriptionKeywords(exprSeg) {
  let output = {};
  let parsed = exprSeg.match(descSegmentReges);
  if (!parsed) {
    console.error(`Wrong description keyword expression: ${exprSeg}.`);
  }
  parsed.forEach((p, i) => {
    output.type = 'keyword';
    if (i == 0) {
      if (descriptionKeywords.includes(p)) output.key = p;
      else if (p.match(/domain\[[0-9]+\]/g)) output.key = p;
      else console.error(`Unidentifiable keyword: ${p}.`);
    } else {
      let ps = p.split("=");
      let value = ps[1].replace(/\"/gi, '');
      if (ps[0] === "duration") {
        output.duration = parseFloat(value);
      } else if (ps[0] === "first") {
        output.first = parseInt(value);
      } else if (ps[0] === "last") {
        output.last = parseInt(value);
      } else if (ps[0] === "item") {
        if (descriptionKeywords.includes(value)) {
          output.item = { keyword: value };
        } else if (value.match(/domain\[[0-9]+\]/g)) {
          output.item = { keyword: value };
        } else {
          output.item = { literal: value.split(",").map(d => d.trim()) };
        }
      } else if (ps[0] === "value") {
        if (descriptionKeywords.includes(value)) {
          output.value = { keyword: value };
        } else if (value.match(/domain\[[0-9]+\]/g)) {
          output.value = { keyword: value };
        } else {
          output.value = { literal: value };
        }
      } else if (ps[0].match(/v[0-9]+/g)?.length == 1) {
        if (!output.value) output.value = [];
        let vi = parseInt(ps[0].substring(1));
        if (descriptionKeywords.includes(value)) {
          output.value[vi] = { keyword: value };
        } else if (value.match(/domain\[[0-9]+\]/g)) {
          output.value[vi] = { keyword: value };
        } else {
          output.value[vi] = { literal: value };
        }
      } else {
        if (descriptionKeywords.includes(value)) {
          output[ps[0]] = { keyword: value };
        } else if (value.match(/domain\[[0-9]+\]/g)) {
          output[ps[0]] = { keyword: value };
        } else {
          output[ps[0]] = { literal: value };
        }
      }
    }
  });
  return output;
}