import { expect, test } from 'vitest';
import { make3DScaleFunction } from '../src/audio-graph-scale-3d';

test('3D Scale Function Test', () => {
  const encoding = {
    domain: [-5, 0, 5],
    range: [-1, 0, 1],
  };

  const scaleFunction = make3DScaleFunction(encoding);

  expect(scaleFunction).to.be.a('function');
  expect(scaleFunction({ x: 0, y: 0, z: 0 })).to.deep.equal({ x: 0, y: 0, z: 0 });
  expect(scaleFunction({ x: 5, y: 5, z: 5 })).to.deep.equal({ x: 1, y: 1, z: 1 });
  expect(scaleFunction({ x: -5, y: -5, z: -5 })).to.deep.equal({ x: -1, y: -1, z: -1 });
  expect(scaleFunction({ x: 5, y: 0, z: 5 })).to.deep.equal({ x: 1, y: 0, z: 1 });
});