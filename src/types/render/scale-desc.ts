// keywords used in the markup
export const DescKeySound = 'sound',
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

export const DescKeyDomainNumberedRegex = /domain\[[0-9]+\]/g;

export type DescKeyDomainNumbered = `domain[${number}]`;

export const descriptionKeywords = [
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

export type DescItemKey = typeof descriptionKeywords[number] | DescKeyDomainNumbered;

// intermediate format (right after parsed)
export const K_Text = 'text',
  K_Keyword = 'keyword';

// keyword and literal
export type KeyedDescItem = {
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

// output type
export const M_Text = 'text',
  M_Sound = 'sound';

// output format (queue, used as a list)
export type DescriptionMarkupQueueTextItem = {
  type: typeof M_Text;
  text?: string;
  speechRate?: number;
};
export type DescriptionMarkupQueueSoundItem = {
  type: typeof M_Sound;
  continuous: boolean;
  value: string | number | undefined | Array<string | number | undefined>;
  duration: number;
};
export type DescriptionMarkupQueueItem
  = DescriptionMarkupQueueTextItem
  | DescriptionMarkupQueueSoundItem;
