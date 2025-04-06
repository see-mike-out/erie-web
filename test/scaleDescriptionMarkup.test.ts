// sum.test.js
import { expect, test } from 'vitest'
import { compileDescriptionMarkup, ParsedScaleFunction, PITCH_chn, QUANT } from '../src';

test('list element generation', () => {
  let test_markup = '<list item="apple,pear,juice,melon,grape" first="2" last="2" join=", " and=" and ">';

  let expected = [
    {
      type: 'text',
      text: 'apple, pear, melon, and grape',
      speechRate: 1.75
    }
  ];

  // @ts-ignore
  let scale_fun: ParsedScaleFunction = () => { };
  scale_fun.properties = {
    channel: PITCH_chn,
    encodingType: QUANT
  };

  expect(compileDescriptionMarkup(test_markup, 'pitch', scale_fun, 1.75, 'second')).toStrictEqual(expected);
})