import { expect, test } from 'vitest';
import { normalizeSpecification } from '../src/normalize';
import type { TopLevelSpec } from '../src/types';
import { compileAudioGraph } from '../src/audio-graph';
import { SequenceStream, UnitStream } from 'compile';


// Case 1: Basic Loudness Mapping
test("normalize loudness with basic field and type", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    tone: { type: "sine" },
    encoding: {
      time: { field: 'time_test', type: 'quantitative', scale: { length: 5 } },
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  const sequence = await compileAudioGraph(spec, {}) as SequenceStream;
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness?.field).toBe("Body Mass (g)");
    expect(normalized[0].stream.encoding?.loudness?.type).toBe("quantitative");
    expect((sequence.streams[0] as UnitStream)?.scales?.loudness?.properties?.range).toEqual([0, 1]); // default
  }
});

// Case 2: Custom Scale Domain and Range
test("normalize loudness with custom domain and range", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    tone: { type: "sine" },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative",
        scale: {
          domain: [0, 7000],
          range: [0, 1]
        }
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness?.scale?.domain).toEqual([0, 7000]);
    expect(normalized[0].stream.encoding?.loudness?.scale?.range).toEqual([0, 1]);
  }
});

// Case 3: Clipping and Overflow Handling
test("normalize loudness with over-range values", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 10000 }] },
    tone: { type: "sine" },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative",
        scale: {
          domain: [0, 5000],
          range: [0, 2]
        }
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness?.scale?.range instanceof Array).toBe(true);
    if (normalized[0].stream.encoding?.loudness?.scale?.range instanceof Array) {
      expect(normalized[0].stream.encoding?.loudness?.scale?.range?.[1]).toBeGreaterThan(1);
    }
  }
});

// Case 4: Omitted Scale Object
test("normalize loudness with omitted scale infers defaults", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    tone: { type: "sine" },
    encoding: {
      time: { field: 'time_test', type: 'quantitative', scale: { length: 5 } },
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const sequence = await compileAudioGraph(spec, {}) as SequenceStream;
  const { normalized, scaleDefinitions } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect((sequence.streams[0] as UnitStream)?.scales?.loudness?.properties?.range).toEqual([0, 1]); // default
  }
});

// Case 5: Constant Loudness
test("normalize loudness with fixed constant value", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{}] },
    tone: { type: "sine" },
    encoding: {
      loudness: { value: 0.75 }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness.value).toBe(0.75);
  }
});

// Case 6: Muted loudness (0 gain)
test("normalize loudness with zero gain", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 0 }] },
    tone: { type: "sine" },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative",
        scale: {
          domain: [0, 5000],
          range: [0, 1]
        }
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness?.field).toBe("Body Mass (g)");
  }
});

// Case 7: Minimal Valid Loudness Spec
test("normalize loudness with minimal spec", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    tone: { type: 'sine' },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
  if ('stream' in normalized[0]) {
    expect(normalized[0].stream.encoding?.loudness?.field).toBe("Body Mass (g)");
  }
});
