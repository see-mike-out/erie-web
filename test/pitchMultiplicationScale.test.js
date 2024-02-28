// sum.test.js
import { expect, test } from 'vitest'
import { makeQuantitativeScaleFunction } from '../src/scale/audio-graph-scale-quant';

test('quantitative scale function', () => {
  let scaleInfo = {
    "id": "scale-T7ETeN",
    "channel": "pitch",
    "type": "quantitative",
    "dataName": "data__1",
    "field": [
      "value"
    ],
    "scale": {
      "polarity": "positive",
      "type": "multiplication",
      "range": [100, 700],
      "title": "Value"
    },
    "streamID": [
      "stream-or8C5s"
    ],
    "parentType": null,
    "collected": [
      "data__1_value"
    ],
    "data": [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 3.25 },
      { value: 3.5 },
      { value: 3.75 },
      { value: 4 }
    ],
    "values": [
      1, 2, 3, 3.25, 3.5, 3.75, 4
    ],
    "format": ".4"
  }
  let values = [
    1, 2, 3, 3.25, 3.5, 3.75, 4
  ];
  let extracted = {
    "polarity": "positive",
    "maxDistinct": true,
    "zero": false,
    "domainMax": 4,
    "domainMin": 1
  };
  let func = makeQuantitativeScaleFunction('pitch', scaleInfo, values, extracted)

  let expected = values.map((d) => {
    return (700 - 100) * (d - 1) / (4 - 1) + 100;
  })
  for (let i = 0; i < values.length; i++) {
    expect(func(values[i])).toBeCloseTo(expected[i]);
  }
})