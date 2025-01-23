// sum.test.js
import { expect, test } from 'vitest'
import { compileDescriptionMarkup } from '../src/scale/audio-graph-scale-desc-parser';

test('list element generation', () => {
  let test_markup = '<list item="apple,pear,juice,melon,grape" first="2" last="2" join=", " and=" and ">';

  let expected = [
    {
      type: 'text',
      text: 'apple, pear, melon, and grape',
      speechRate: 1.75
    }
  ];
  
  expect(compileDescriptionMarkup(test_markup, 'pitch', {}, 1.75, 'second')).toStrictEqual(expected);
})