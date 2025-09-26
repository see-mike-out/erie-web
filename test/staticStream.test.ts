import { describe, test, expect } from "vitest";
import type { OverlayStreamSpec, StreamingSpec, TopLevelSpec, UnitStreamSpec } from "../src/types/spec";
import { isSingleStream, normalizeSpecification } from "../src/normalize";
import { DatasetSpecItemNormed } from "types";

describe("Static Stream Normalization", () => {
  test("Case 1: Single sonification stream normalizes correctly", async () => {
    const spec: StreamingSpec = {
      title: "Simple Stream",
      description: "A single stream test",
      data: {
        stream: true,
        test: {
          values: [{ x: 1, y: 2 }]
        }
      },
      tone: {
        hasBaseTone: true
      },
      encoding: {
        pitch: {
          field: "y"
        }
      }
    };

    const { normalized } = await normalizeSpecification(spec);
    expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);
    if ('stream' in normalized[0]) {
      expect(normalized.length).toBe(1);
      expect(normalized[0]).toHaveProperty("stream");
      expect(normalized[0].stream.data).toBeDefined();
    }
  });

  test("Case 2: Sequence sonification stream normalizes correctly", async () => {
    const spec: StreamingSpec = {
      title: "Sequence",
      description: "Sequence of streams",
      data: {
        stream: true,
        test: {
          values: [{ time: 0, a: 1 }]
        }
      },
      tone: {
        hasBaseTone: true
      },
      encoding: {
        time: { field: 'a', type: 'quantitative', scale: {} },
        pitch: { field: 'b', type: 'quantitative', scale: {} }
      }
    };

    const { normalized, datasets } = await normalizeSpecification(spec);
    expect(normalized.length > 0 && 'stream' in normalized[0]).toBe(true);

    if ('stream' in normalized[0]) {
      expect(normalized.length).toBe(1);
      expect(normalized[0]).toHaveProperty("stream");
      expect('values' in datasets['test']).toBe(true);
      if ('values' in datasets['test']) {
        expect(datasets['test'].values.length).toBe(1);
      }
    }
  });

  test("Case 3: Overlay sonification stream normalizes correctly", async () => {
    const spec: OverlayStreamSpec = {
      title: "Overlay Test",
      description: "Two overlapping streams",
      datasets: [{
        name: 'overlay_ds',
        values: [{ time: 0, value: 1 }, { time: 1, value: 2 }]
      }],
      overlay: [
        {
          name: "stream1",
          data: { name: "overlay_ds" },
          tone: { type: "sine" },
          encoding: {
            pitch: { field: "value" }
          }
        },
        {
          name: "stream2",
          data: { name: "overlay_ds" },
          tone: { type: "triangle" },
          encoding: {
            loudness: { field: "value" }
          }
        }
      ]
    };

    const { normalized, datasets } = await normalizeSpecification(spec);
    expect(normalized.length > 0 && 'overlay' in normalized[0]).toBe(true);

    if ('overlay' in normalized[0]) {
      expect(normalized.length).toBe(1);
      expect(normalized[0]).toHaveProperty("overlay");
      expect(normalized[0].overlay.length).toBe(2);
      expect('values' in datasets['overlay_ds']).toBe(true);
      if ('values' in datasets['overlay_ds']) {
        expect(datasets['overlay_ds'].values.length).toBe(2);
      }
    }
  });

  test("UnitStream includes required tone and encoding fields", async () => {
    const unitStream: UnitStreamSpec = {
      name: "basic_unit",
      data: {
        values: [{ time: 0, x: 10 }]
      },
      tone: { type: "sawtooth" },
      encoding: {
        pitch: {
          field: "x"
        }
      }
    };

    const spec: TopLevelSpec = {
      sequence: [unitStream, unitStream]
    };

    const { normalized } = await normalizeSpecification(spec);
    console.log(normalized)
    expect(normalized.length == 3 && 'intro' in normalized[0]).toBe(true);
    expect(normalized.length == 3 && 'stream' in normalized[1]).toBe(true);
    expect(normalized.length == 3 && 'stream' in normalized[1]).toBe(true);
  });
});

