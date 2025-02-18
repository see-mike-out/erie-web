import { expect, test } from 'vitest';
import { make3DScaleFunction } from '../src/audio-graph-scale-3d';

test('3D Scale Function Test', () => {
  const encoding = {
    domain: [-5, 0, 5],
    range: [-1, 0, 1],
    default: { x: 0, y: 0, z: 0 }
  };

  const scaleFunction = make3DScaleFunction(encoding);

  expect(scaleFunction).to.be.a('function');
  expect(scaleFunction(0, 0, 0)).to.deep.equal({ x: 0, y: 0, z: 0 });
  expect(scaleFunction(5, 5, 5)).to.deep.equal({ x: 1, y: 1, z: 1 });
  expect(scaleFunction(-5, -5, -5)).to.deep.equal({ x: -1, y: -1, z: -1 });
  expect(scaleFunction(5)).to.deep.equal({ x: 1, y: 0, z: 0 }); // Stereo panning

  expect(() => scaleFunction(5, undefined, undefined, 5, 90, 0)).to.throw('Cannot specify both cartesian and spherical coordinates');
});

test('Polar Coordinates Test', () => {
  const encoding = {
    domain: [-5, 0, 5],
    range: [-1, 0, 1],
    default: { x: 0, y: 0, z: 0 }
  };

  const scaleFunction = make3DScaleFunction(encoding);

  const result1 = scaleFunction(undefined, undefined, undefined, 5, 90, 0);
  expect(result1.x).to.be.closeTo(1, 1e-10);
  expect(result1.y).to.be.closeTo(0, 1e-10);
  expect(result1.z).to.be.closeTo(0, 1e-10);

  const result2 = scaleFunction(undefined, undefined, undefined, 5, 0, 0);
  expect(result2.x).to.be.closeTo(0, 1e-10);
  expect(result2.y).to.be.closeTo(0, 1e-10);
  expect(result2.z).to.be.closeTo(1, 1e-10);

  const result3 = scaleFunction(undefined, undefined, undefined, 5, 90, 90);
  expect(result3.x).to.be.closeTo(0, 1e-10);
  expect(result3.y).to.be.closeTo(1, 1e-10);
  expect(result3.z).to.be.closeTo(0, 1e-10);

  const result4 = scaleFunction(undefined, undefined, undefined, 5, 45, 45);
  expect(result4.x).to.be.closeTo(5 * Math.sin(45 * Math.PI / 180) * Math.cos(45 * Math.PI / 180), 1e-10);
  expect(result4.y).to.be.closeTo(5 * Math.sin(45 * Math.PI / 180) * Math.sin(45 * Math.PI / 180), 1e-10);
  expect(result4.z).to.be.closeTo(5 * Math.cos(45 * Math.PI / 180), 1e-10);

  const result5 = scaleFunction(undefined, undefined, undefined, 5, 180, 0);
  expect(result5.x).to.be.closeTo(0, 1e-10);
  expect(result5.y).to.be.closeTo(0, 1e-10);
  expect(result5.z).to.be.closeTo(-1, 1e-10);

  const result6 = scaleFunction(undefined, undefined, undefined, 5, 0, 90);
  expect(result6.x).to.be.closeTo(0, 1e-10);
  expect(result6.y).to.be.closeTo(1, 1e-10);
  expect(result6.z).to.be.closeTo(0, 1e-10);

  const result7 = scaleFunction(undefined, undefined, undefined, 5, 90, 180);
  expect(result7.x).to.be.closeTo(-1, 1e-10);
  expect(result7.y).to.be.closeTo(0, 1e-10);
  expect(result7.z).to.be.closeTo(0, 1e-10);

  const result8 = scaleFunction(undefined, undefined, undefined, 5, 135, 45);
  expect(result8.x).to.be.closeTo(5 * Math.sin(135 * Math.PI / 180) * Math.cos(45 * Math.PI / 180), 1e-10);
  expect(result8.y).to.be.closeTo(5 * Math.sin(135 * Math.PI / 180) * Math.sin(45 * Math.PI / 180), 1e-10);
  expect(result8.z).to.be.closeTo(5 * Math.cos(135 * Math.PI / 180), 1e-10);
});