import { scaleLinear } from 'd3-scale';

interface Encoding {
  domain: number[];
  range: number[];
  default?: { x: number, y: number, z: number };
}

export function make3DScaleFunction(
  encoding: Encoding
): (panX?: number, panY?: number, panZ?: number, panRadius?: number, panPolar?: number, panAzimuth?: number) => { x: number, y: number, z: number } {
  const { domain, range, default: defaultValue = { x: 0, y: 0, z: 0 } } = encoding;
  const scale = scaleLinear().domain(domain).range(range);

  return (panX?: number, panY?: number, panZ?: number, panRadius?: number, panPolar?: number, panAzimuth?: number) => {
    if ((panX !== undefined || panY !== undefined || panZ !== undefined) && (panRadius !== undefined || panPolar !== undefined || panAzimuth !== undefined)) {
      throw new Error('Cannot specify both cartesian and spherical coordinates');
    }

    if (panX !== undefined && panY === undefined && panZ === undefined && panRadius === undefined && panPolar === undefined && panAzimuth === undefined) {
      // Stereo panning
      return {
        x: scale(panX),
        y: scale(defaultValue.y),
        z: scale(defaultValue.z)
      };
    }

    if (panRadius !== undefined && panPolar !== undefined && panAzimuth !== undefined && panX === undefined && panY === undefined && panZ === undefined) {
      const polarRad = panPolar * (Math.PI / 180);
      const azimuthRad = panAzimuth * (Math.PI / 180);
      panX = panRadius * (Math.sin(polarRad) * Math.cos(azimuthRad));
      panY = panRadius * (Math.sin(polarRad) * Math.sin(azimuthRad));
      panZ = panRadius * Math.cos(polarRad);
    }

    return {
      x: scale(panX !== undefined ? panX : defaultValue.x),
      y: scale(panY !== undefined ? panY : defaultValue.y),
      z: scale(panZ !== undefined ? panZ : defaultValue.z)
    };
  };
}