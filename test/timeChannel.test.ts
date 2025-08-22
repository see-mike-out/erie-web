import { expect, test, describe } from 'vitest';
import { normalizeSpecification } from '../src/normalize';
import type { StreamingSpec } from '../src/types';
import type { NormalizedSingleStreamItem } from '../src';

function makeTimeSpec(overrides: Partial<StreamingSpec>): StreamingSpec {
  return {
    title: 'Time Spec Test',
    data: {
      values: [
        { Origin: 'USA', Miles_per_Gallon: 20, MPG_Lower: 15, MPG_Upper: 25, duration: 0.7 },
        { Origin: 'Europe', Miles_per_Gallon: 30, MPG_Lower: 28, MPG_Upper: 32, duration: 0.8 },
      ]
    },
    tone: { base_tone: true },
    encoding: {},
    ...overrides
  } as StreamingSpec;
}

// Case 1: Absolute Timing with Fixed Duration
describe('Absolute Timing with Fixed Duration', () => {
  test('Normalizes absolute time with scale length', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: {
          field: 'Miles_per_Gallon',
          type: 'quantitative',
          scale: { length: 5 }
        }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const enc = stream.encoding;


    console.log(JSON.stringify(normalized, null, 2));

    expect(enc.time.field).toEqual('Miles_per_Gallon');
    expect(enc.time.type).toEqual('quantitative');
    expect(enc.time.scale.length).toEqual(5);
  });
});

// Case 2: Absolute Timing with Varied Duration
describe('Absolute Timing with Varied Duration', () => {
  test('Normalizes time and time2 channels correctly', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: { field: 'MPG_Lower', type: 'quantitative' },
        time2: { field: 'MPG_Upper', type: 'quantitative' }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const enc = stream.encoding;

    expect(enc.time.field).toEqual('MPG_Lower');
    expect(enc.time2?.field).toEqual('MPG_Upper');
  });

  test('Rejects time2 if time uses binning', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: { field: 'MPG', type: 'quantitative', scale:{ length: 5}, bin: true },
        time2: { field: 'MPG2' }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const enc = stream.encoding;
    console.log(enc.time2.field);
    expect(enc.time2).toBeUndefined();
  });
});

// Case 4: Simultaneous Timing
describe('Simultaneous Timing', () => {
  test('Simultaneous time starts all tones at 0', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: { field: 'T', type: 'quantitative', scale: { timing: 'simultaneous' } }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const enc = stream.encoding;

    expect(enc.time.scale.timing).toBe('simultaneous');
  });
});
// Case 5: Tick Configuration
describe('Tick Configuration', () => {

  test('Default tick normalization', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: {
          field: 'Origin',
          type: 'nominal',
          tick: {
            name: 'default_tick',
            interval: 0.5,
            // band, playAtTime0, oscType, pitch, loudness should hanve default values
          } 
        }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const tick = stream.encoding.time.tick;

    expect(tick).toBeDefined();
    expect(tick?.interval).toBe(0.5);
    expect(tick?.band).toBe(0.1);
    expect(tick?.playAtTime0).toBe(true);
    expect(tick?.oscType).toBe('sine');
    expect(tick?.pitch).toBe(150);
    expect(tick?.loudness).toBe(0.4);
  });

  test('Custom tick config is parsed correctly', async () => {
    const spec = makeTimeSpec({
      encoding: {
        time: {
          field: 'Origin',
          type: 'nominal',
          tick: {
            interval: 1,
            band: 0.2,
            playAtTime0: false,
            oscType: 'square',
            pitch: 300,
            loudness: 0.8,
            name: 'custom_tick'
          }
        }
      }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const tick = stream.encoding.time.tick;

    expect(tick).toBeDefined();
    expect(tick?.interval).toBe(1);
    expect(tick?.band).toBe(0.2);
    expect(tick?.playAtTime0).toBe(false);
    expect(tick?.oscType).toBe('square');
    expect(tick?.pitch).toBe(300);
    expect(tick?.loudness).toBe(0.8);
    expect(tick?.name).toBe('custom_tick');
  });

});

// Case 6: Duration Field Channels
describe('Duration Field Channels', () => {
  test('Duration field channel is parsed correctly', async () => {
    const spec = makeTimeSpec({
      encoding: { duration: { field: 'duration', type: 'quantitative' } }
    });

    const { normalized } = await normalizeSpecification(spec);
    const stream = (normalized[0] as NormalizedSingleStreamItem).stream;
    const enc = stream.encoding;

    expect(enc.duration?.field).toBe('duration');
    expect(enc.duration?.type).toBe('quantitative');
  });
});
