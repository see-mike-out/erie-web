import { describe, test, expect } from "vitest";
import { normalizeSpecification } from '../src/normalize';
import type { StreamingSpec } from "../src/types/spec";
describe("Static Stream Normalization", () => {
  test("Case 1: Single sonification stream normalizes correctly", () => {
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
          channel: "pitch",
          field: "y"
        }
      }
    };

    const result = normalizeStream(spec);

    expect(result.normalized.length).toBe(1);
    expect(isNormalizedSingleStreamItem(result.normalized[0])).toBe(true);
    expect(result.normalized[0]).toHaveProperty("stream");
    expect(result.datasets).toBeDefined();
  });

  test("Case 2: Sequence sonification stream normalizes correctly", () => {
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

    const result = normalizeStream(spec);

    expect(result.normalized.length).toBe(1);
    expect(isNormalizedSingleStreamItem(result.normalized[0])).toBe(true);
    expect(result.datasets["ds1"].values.length).toBe(1);
  });

  test("Case 3: Overlay sonification stream normalizes correctly", () => {
    const spec: StreamingSpec = {
      title: "Overlay Test",
      description: "Two overlapping streams",
      data: {
        stream: true,
        test: {
          values: [{ time: 0, value: 1 }, {time: 1, value: 2}]
        }
      },
      stream: [
        {
          name: "stream1",
          data: { name: "overlay_ds" },
          tone: { waveform: "sine", freq: 440 },
          encoding: {
            pitch: { channel: "pitch", field: "value" }
          }
        },
        {
          name: "stream2",
          data: { name: "overlay_ds" },
          tone: { waveform: "triangle", freq: 880 },
          encoding: {
            volume: { channel: "volume", field: "value" }
          }
        }
      ]
    };

    const result = normalizeStream(spec);

    expect(result.normalized.length).toBe(1);
    expect(isNormalizedOverlayItem(result.normalized[0])).toBe(true);
    const overlayItem = result.normalized[0];
    expect(overlayItem.overlay.length).toBe(2);
    expect(overlayItem.overlay[0].tone.freq).toBe(440);
    expect(overlayItem.overlay[1].tone.freq).toBe(880);
  });

  test("UnitStream includes required tone and encoding fields", () => {
    const unitStream = {
      name: "basic_unit",
      data: {
        values: [{ time: 0, x: 10 }]
      },
      tone: { waveform: "sawtooth", freq: 300 },
      encoding: {
        pitch: {
          channel: "pitch",
          field: "x"
        }
      }
    };

    const spec: StreamingSpec = {
      stream: [unitStream]
    };

    const result = normalizeStream(spec);
    expect(result.normalized[0]).toHaveProperty("stream");
    expect(result.normalized[0].stream.tone.waveform).toBe("sawtooth");
  });
});
function normalizeStream(spec: StreamingSpec) {
    throw new Error("Function not implemented.");
}

