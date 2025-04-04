import { expect, test } from 'vitest'
import { makeQuantitativeScaleFunction } from '../src/scale/audio-graph-scale-quant';
import { PAN_chn } from '../src/types';

test('Quantitative Scale Function Test', () => {
  const encoding = {
    field: "residual",
    type: "quantitative",
    scale: {
      domain: [-2.5, 0, 2.5],
      range: [-1, 0, 1],
    },
    format: ".4",
  };

  const values = [0, 1, 2, 3, 4, 5];
  const info = {};

  const scaleFunction = makeQuantitativeScaleFunction(PAN_chn, encoding, values, info);

  expect(scaleFunction).to.be.a('function');
  expect(scaleFunction(0)).to.equal(0);
  expect(scaleFunction(2.5)).to.equal(1);
  expect(scaleFunction(-2.5)).to.equal(-1);
});