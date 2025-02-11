import { scaleLinear } from 'd3-scale';

export function make3DScaleFunction(
  encoding: { domain: number[], range: number[] }
): (value: { x: number, y: number, z: number }) => { x: number, y: number, z: number } {
  const { domain, range } = encoding;
  const scale = scaleLinear().domain(domain).range(range);

  return (value: { x: number, y: number, z: number }) => {
    return {
      x: scale(value.x),
      y: scale(value.y),
      z: scale(value.z)
    };
  };
}