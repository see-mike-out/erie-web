import { expect, test } from 'vitest'
import { PAN_X_chn, ParsedScaleDefinition, makeQuantitativeScaleFunction } from '../src';

test('Quantitative Scale Function Test', () => {
  const encoding: ParsedScaleDefinition = {
    id: "aaaaaa",
    channel: "PAN_X_chn",
    field: ["residual"],
    type: "quantitative",
    scale: {
      domain: [-2.5, 0, 2.5],
      range: [-1, 0, 1],
    },
    format: ".4",
    dataName: "values",
    streamID: ["AAAAAA"],
    parentType: null,
  };

  const values = [0, 1, 2, 3, 4, 5];
  const info = {};

  const scaleFunction = makeQuantitativeScaleFunction(PAN_X_chn, encoding, values, info);

  expect(scaleFunction).to.be.a('function');
  expect(scaleFunction(0)).to.equal(0);
  expect(scaleFunction(2.5)).to.equal(1);
  expect(scaleFunction(-2.5)).to.equal(-1);
});