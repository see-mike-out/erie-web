import { expect, test, describe } from 'vitest';
import { normalizeSpecification } from '../src/normalize';
import type { StreamingSpec } from '../src/types';
import type { NormalizedSingleStreamItem } from '../src';


// Case 1: Basic Loudness Mapping
test("normalize loudness with basic field and type", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  if ('stream' in normalized)
  expect(normalized[0].stream.encoding?.loudness?.field).toBe("Body Mass (g)");
  expect(normalized[0].encoding?.loudness?.type).toBe("quantitative");
  expect(normalized[0].encoding?.loudness?.scale?.range).toEqual([0, 1]); // default
});

// Case 2: Custom Scale Domain and Range
test("normalize loudness with custom domain and range", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
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
  expect(normalized.encoding?.loudness?.scale?.domain).toEqual([0, 7000]);
  expect(normalized.encoding?.loudness?.scale?.range).toEqual([0, 1]);
});

// Case 3: Clipping and Overflow Handling
test("normalize loudness with over-range values", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 10000 }] },
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
  expect(normalized.encoding?.loudness?.scale?.range?.[1]).toBeGreaterThan(1);
});

// Case 4: Omitted Scale Object
test("normalize loudness with omitted scale infers defaults", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.encoding?.loudness?.scale?.range).toEqual([0, 1]);
});

// Case 5: Constant Loudness
test("normalize loudness with fixed constant value", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{}] },
    encoding: {
      loudness: 0.75
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  expect(normalized.encoding?.loudness).toBe(0.75);
});

// Case 6: Muted loudness (0 gain)
test("normalize loudness with zero gain", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 0 }] },
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
  expect(normalized.encoding?.loudness?.field).toBe("Body Mass (g)");
});

// Case 7: Invalid field or type
test("rejects loudness with non-numeric type", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ Species: "Gentoo" }] },
    encoding: {
      loudness: {
        field: "Species",
        type: "nominal"
      }
    }
  };
  await expect(normalizeSpecification(spec)).rejects.toThrow();
});

// Case 8: Field and Constant Conflict
test("warns when both field and constant are provided", async () => {
  const spec: any = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      },
      // Conflict: a second loudness value using a constant key
      loudness_constant: 0.8
    }
  };
  await expect(normalizeSpecification(spec)).rejects.toThrow();
});

// Case 9: Minimal Valid Loudness Spec
test("normalize loudness with minimal spec", async () => {
  const spec: TopLevelSpec = {
    data: { values: [{ "Body Mass (g)": 3000 }] },
    encoding: {
      loudness: {
        field: "Body Mass (g)",
        type: "quantitative"
      }
    }
  };
  const { normalized } = await normalizeSpecification(spec);
  const enc = normalized[0]?.encoding;
  expect(enc?.loudness?.field).toBe("Body Mass (g)");
});
