// todo: scale/scaleProps <- what are you?
// todo: check DescriptionMarkupQueueItem complies with a QueueItem

// WORKFLOW
// input "markup expression" (string)
// -> compiler 
// |  -> parser (format check, parse into interpretable formats)
// |  |  -> Determine literal (free string) / keyword (<...>)
// |  |  &  Parse keyword item
// |  |  => return KeyedDescItem[]
// |  => return ParsedDescMarkup[]
// => return DescriptionMarkupQueueItem[] (playable Queue)

import { format, timeFormat } from "d3";
import { listString } from "../util/audio-graph-format-util";
import { jType } from "../util/audio-graph-typing-util";
import { TIME_chn } from "../types/encoding";
import { TimeUnitUnits } from "../types/time";

// constants and types

// keywords used in the markup
const DescKeySound = 'sound',
  DescKeyList = 'list',
  DescKeyDomain = 'domain',
  DescKeyDomainMin = 'domain.min',
  DescKeyDomainMax = 'domain.max',
  DescKeyDomainLength = 'domain.length',
  DescKeyChannel = 'channel',
  DescKeyField = 'field',
  DescKeyAggregate = 'aggregate',
  DescKeyTitle = 'title',
  DescKeyRange = 'range',
  DescKeyRangeMin = 'range.min',
  DescKeyRangeMax = 'range.max',
  DescKeyRangeLength = 'range.length',
  DescKeyTimeUnit = 'timeUnit';

const DescKeyDomainNumberedRegex = /domain\[[0-9]+\]/g;

type DescKeyDomainNumbered = `domain[${number}]`;

const descriptionKeywords = [
  DescKeySound,
  DescKeyList,
  DescKeyDomain,
  DescKeyDomainMin,
  DescKeyDomainMax,
  DescKeyDomainLength,
  DescKeyChannel,
  DescKeyField,
  DescKeyAggregate,
  DescKeyTitle,
  DescKeyRange,
  DescKeyRangeMin,
  DescKeyRangeMax,
  DescKeyRangeLength,
  DescKeyTimeUnit
];

type DescItemKey = typeof descriptionKeywords[number] | DescKeyDomainNumbered;


// output type
const M_Text = 'text',
  M_Sound = 'sound';

// output format (queue, used as a list)
export interface DescriptionMarkupQueueItem {
  type: typeof M_Text | typeof M_Sound;
  text?: string;
  speechRate?: number;
  continuous?: boolean;
  value?: string | number | undefined | Array<string | number | undefined>;
  duration?: number;
}

// intermediate format (right after parsed)
const K_Text = 'text',
  K_Keyword = 'keyword';

// keyword and literal
type KeyedDescItem = {
  keyword?: string;
  literal?: string;
}

export interface ParsedDescMarkup {
  type: typeof K_Text | typeof K_Keyword,
  text?: string,
  key?: DescItemKey,
  duration?: number,
  first?: number,
  last?: number,
  item?: KeyedDescItem[],
  value?: KeyedDescItem | KeyedDescItem[],
  join?: KeyedDescItem,
  and?: KeyedDescItem,
  speechRate?: number
}

// regex for parsing
// overall formatting to determine parsability of a markup expression
const exprRegex = /(\<[^\<\>]+\>|[^\<\>]+)/g;
// parsing each semgent of a markup element <...>
const descSegmentRegex = /(([a-zA-Z0-9\.]+=\"[^\"]+\")|[a-zA-Z\.0-9\[\]]+)/g; 


// markup compiler (generating queue items)
export function compileDescriptionMarkup(expression: string, channel: string, scale, speechRate: number, timeUnit: TimeUnitUnits): DescriptionMarkupQueueItem[] {
  if (expression.length == 0 || !expression) return [];
  let exprParsed: ParsedDescMarkup[] | null = parseDescriptionMarkup(expression);
  if (exprParsed != null) {

    let scaleProps = scale.properties;
    let preQueue: DescriptionMarkupQueueItem[] = [];
    for (const seg of exprParsed) {
      if (seg.type === "text") {
        let item: DescriptionMarkupQueueItem = {
          type: 'text',
          text: seg.text,
          speechRate
        }
        preQueue.push(item);
      } else {
        // implicit: seg.type === "keyword"
        if (seg.key === "sound") {
          let item: DescriptionMarkupQueueItem = { type: 'sound' };
          if (jType(seg.value) === "Array") {
            // <sound v0="X0" vN="XN" duration="D">
            item.continuous = true;
            item.value = (<KeyedDescItem[]>seg.value)?.map((v) => getLKvalues(v, channel, scaleProps, timeUnit));
          } else {
            // <sound value="X" duration="D">
            item.continuous = false;
            item.value = getLKvalues(<KeyedDescItem>seg.value, channel, scaleProps, timeUnit);
          }
          if (seg.duration) {
            item.duration = seg.duration;
          } else {
            // computing duration for underspeicifed or discrete items
            if (item.continuous && item.value instanceof Array) item.duration = (timeUnit === 'beat' ? 1 : 0.5) * (item.value?.length || 0);
            else item.duration = (timeUnit === 'beat' ? 1 : 0.5);
          }
          preQueue.push(item);
        } else if (seg.key === "list") {
          // <list item="P,Q,..." first="F" last="L" join="J" and="A">
          let items = seg.item;
          let elements: Array<string | number | undefined> | undefined = undefined;
          if (!items) {
            elements = [getKeywordValues('domain', channel, scaleProps, timeUnit)];
          } else if (items != undefined && items instanceof Array) {
            elements = items?.map((d) => {
              if (d.keyword) getKeywordValues(d.keyword, channel, scaleProps, timeUnit);
              else return d.literal;
            }).flat();
          }
          let formatter = (d: any) => d;
          if (scaleProps?.format) {
            if (scaleProps.formatType === "number") formatter = format(scaleProps.format);
            else if (scaleProps.formatType === "datetime") formatter = timeFormat(scaleProps.format);
          }
          if (elements instanceof Array) {
            elements = elements.map((d) => jType(d) === 'Number' ? formatter(d) : d);

            let first = seg.first;
            let last = seg.last;
            let item: DescriptionMarkupQueueItem = { type: 'text' };
            let textItems = [];
            if (first) textItems.push(...elements.slice(0, first));
            if (last) textItems.push(...elements.slice(elements.length - last, elements.length));
            let join = seg.join?.literal || ", ", and = seg.and?.literal;
            item.text = listString(textItems, <string>join, and ? true : false, <string | undefined>and);
            item.speechRate = speechRate;
            preQueue.push(item);
          }
        } else {
          if (seg.key) {
            let text = getKeywordValues(seg.key, channel, scaleProps, timeUnit);
            let formatter = (d: any) => (d?.toString() || '');
            if (scaleProps.format) {
              if (scaleProps.formatType === "number") formatter = format(scaleProps.format);
              else if (scaleProps.formatType === "datetime") formatter = timeFormat(scaleProps.format);
            }
            if (text && typeof text === 'number') text = formatter(text);
            else if (typeof text !== 'string') text = formatter(text);
            else text = '';
            preQueue.push({
              type: 'text',
              text: <string>text,
              speechRate
            });
          }
        }
      }
    }

    // flatten (merging text outputs)
    let queue: DescriptionMarkupQueueItem[] = [];
    for (const item of preQueue) {
      if (queue.length > 0 && queue[queue.length - 1].type === 'text' && item.type === 'text' && item.text) {
        queue[queue.length - 1].text += (item.text.startsWith(".") ? "" : " ") + item.text.trim();
      } else {
        queue.push(item);
      }
    }
    return queue;
  }
  return [];
}

function getLKvalues(item: KeyedDescItem, channel: string, scaleProps, timeUnit: TimeUnitUnits): string | number | undefined {
  if (item?.literal) return item.literal;
  else if (item?.keyword) return getKeywordValues(item.keyword, channel, scaleProps, timeUnit);
  else return undefined;
}

function getKeywordValues(keyword: string, channel: string, scaleProps, timeUnit: TimeUnitUnits): string | number | undefined {
  if (keyword === DescKeyDomain) {
    return scaleProps.domain.join(", ");
  } else if (keyword === DescKeyDomainMin) {
    return Math.min(...scaleProps.domain);
  } else if (keyword === DescKeyDomainMax) {
    return Math.max(...scaleProps.domain);
  } else if (keyword.match(DescKeyDomainNumberedRegex) != null) {
    let i = parseInt((<string[]>keyword.match(DescKeyDomainNumberedRegex))[0]);
    return scaleProps.domain[i];
  } else if (keyword === DescKeyDomainLength) {
    return scaleProps.domain.length;
  } if (keyword === DescKeyRange) {
    return scaleProps.range.join(", ");
  } else if (keyword === DescKeyRangeLength) {
    if (channel === TIME_chn) return scaleProps.length;
    else return Math.max(...scaleProps.range) - Math.min(...scaleProps.range);
  } else if (keyword === DescKeyChannel) {
    return channel;
  } else if (keyword === DescKeyField) {
    return scaleProps.field.join(", ");
  } else if (keyword === DescKeyTitle) {
    return scaleProps.title;
  } else if (keyword === DescKeyAggregate) {
    return scaleProps.aggregate;
  } else if (keyword === DescKeyTimeUnit) {
    return timeUnit;
  }
}

// markup parser
export function parseDescriptionMarkup(expression: string): ParsedDescMarkup[] | null {
  // for each chunk of an expression;
  let expr = expression.trim(), hasPeriodAtTheEnd = false;
  if (expr.endsWith(".")) {
    expr = expr.substring(0, expr.length - 1);
    hasPeriodAtTheEnd = true;
  }
  let exprGroups = expr.match(exprRegex);
  if (exprGroups == null) {
    console.error(`Wrong description expression (not parsable): ${expression}.`);
    return null;
  } else {
    let parsed: ParsedDescMarkup[] = [];
    for (const exprSeg of exprGroups) {
      if (exprSeg.startsWith("<")) {
        // sound item or other item should be replaced
        let segParsed: ParsedDescMarkup | null = parseDescriptionKeywords(exprSeg);
        if (segParsed != null) {
          parsed.push(segParsed);
        }
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
}


// keyword parser (atomic)
function parseDescriptionKeywords(exprSeg: string): ParsedDescMarkup | null {
  // for keyworded expressions <...>
  // match if it fits the format
  let parsed = exprSeg.match(descSegmentRegex);

  if (parsed == null) {
    console.error(`Wrong description keyword expression: ${exprSeg}.`);
    return null;
  } else {
    // all are keyworded items
    let output: ParsedDescMarkup = {
      type: 'keyword'
    };
    parsed.forEach((p, i) => {
      if (i == 0) {
        // determining the initial keywords from descriptionKeywords
        if (descriptionKeywords.includes(p)) output.key = p;
        else if (p.match(/domain\[[0-9]+\]/g)) output.key = p;
        else console.error(`Unidentifiable keyword: ${p}.`);
      } else {
        // rest values taking form of `{index}="{value}"`;
        let ps = p.split("=");
        let value = ps[1].trim().replace(/\"/gi, '');
        let index = ps[0].trim();
        if (index === "duration") {
          // duration="0.3", how long it should be if it is a sound
          output.duration = parseFloat(value);
        } else if (index === "first") {
          // first="N(number)": first N items to readout
          output.first = parseInt(value);
        } else if (index === "last") {
          // last="N(number)": last N items to readout
          output.last = parseInt(value);
        } else if (index === "item") {
          // item="A,B,C,...,Z": a list of items to readout no brackets 
          let valueItems = value.split(",").map(d => d.trim());
          output.item = [];
          valueItems.forEach(item => {
            // for each value
            (<KeyedDescItem[]>output.item)?.push(determineKLValue(item));
          });
        } else if (index === "value") {
          // value="X": a data value to map to a sound
          output.value = determineKLValue(value);
        } else if (index === "values") {
          // values="A,B,...,Z"
          // when values are provided as a list
          let valueItems = value.split(",").map(d => d.trim());
          output.value = [];
          valueItems.forEach(item => {
            // for each value
            (<KeyedDescItem[]>output.value)?.push(determineKLValue(item));
          });
        } else if (index.match(/v[0-9]+/g)?.length == 1) {
          // when provided as indexed values
          // v0="33" v1="22"...
          if (!output.value) output.value = [];
          let vi = parseInt(ps[0].substring(1));
          (<KeyedDescItem[]>output.value)[vi] = determineKLValue(value);
        } else if (index === "join") {
          // join=", "; joining list elements
          output.join = { literal: value };
        } else if (index === "and") {
          // join=", "; joining list elements
          output.and = { literal: value };
        } else if (index === "speechRate") {
          output.speechRate = parseFloat(value);
        }
      }
    });
    return output;
  }
}

// sort out literal and keyworded values
function determineKLValue(value: string): KeyedDescItem {
  if (descriptionKeywords.includes(value)) {
    // the value is a keyword
    return { keyword: value };
  } else if (value.match(DescKeyDomainNumberedRegex)) {
    // the value is a keyword for domain indexing
    return { keyword: value };
  } else {
    // the value is literal list
    return { literal: value };
  }
}