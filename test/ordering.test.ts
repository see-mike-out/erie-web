import { test, expect } from "vitest";
import type { SequenceStreamSpec } from "../src/sequence"; // adjust path

// Case 1: Sequence with inline data
test("SequenceStreamSpec with data field", () => {
  const spec: SequenceStreamSpec = {
    title: "Simple sequence with data",
    data: { values: [{ x: 1 }, { x: 2 }] },
    sequence: [
      {
        type: "tone",
        encoding: { pitch: { field: "x", type: "quantitative" } }
      }
    ]
  };

  // Assert presence of data
  if ("data" in spec) {
    expect(spec.data).toBeDefined();
    expect(spec.data.values.length).toBe(2);
  } else {
    throw new Error("Expected spec to use `data` variant");
  }
});

// Case 2: Sequence with datasets
test("SequenceStreamSpec with datasets field", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence using multiple datasets",
    datasets: [
      { name: "ds1", values: [{ t: 0, v: 10 }] },
      { name: "ds2", values: [{ t: 1, v: 20 }] }
    ],
    sequence: [
      {
        type: "tone",
        encoding: { amplitude: { field: "v", type: "quantitative" } }
      }
    ]
  };

  // Assert presence of datasets
  if ("datasets" in spec) {
    expect(spec.datasets).toHaveLength(2);
    expect(spec.datasets[0].values[0].v).toBe(10);
  } else {
    throw new Error("Expected spec to use `datasets` variant");
  }
});

// Case 3: Sequence with tick + wave
test("SequenceStreamSpec with tick and wave", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with tick + wave",
    data: { values: [{ step: 1 }, { step: 2 }] },
    tick: [{ step: 100 }, { step: 200 }],
    wave: [{ type: "sine" }],
    sequence: [
      {
        type: "tone",
        encoding: { pan_x: { field: "step", type: "quantitative" } }
      }
    ]
  };

  if ("data" in spec) {
    expect(spec.data.values.length).toBe(2);
  }
  expect(spec.tick?.length).toBe(2);
  expect(spec.wave?.[0].type).toBe("sine");
});

// Case 4: Sequence with sampling + synth
test("SequenceStreamSpec with sampling and synth", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with sampling and synth",
    datasets: [{ name: "ds1", values: [{ f: 440 }] }],
    sampling: [{ channel: "LOUDNESS_chn", method: "mean" }],
    synth: [{ type: "basic", gain: 0.5 }],
    sequence: [
      {
        type: "tone",
        encoding: { pitch: { field: "f", type: "quantitative" } }
      }
    ]
  };

  if ("datasets" in spec) {
    expect(spec.datasets[0].values[0].f).toBe(440);
  }
  expect(spec.sampling?.[0].method).toBe("mean");
  expect(spec.synth?.[0].type).toBe("basic");
});

// Case 5: Sequence with config
test("SequenceStreamSpec with config", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with config",
    data: { values: [{ f: 220 }] },
    config: { tempo: 120 },
    sequence: [
      {
        type: "tone",
        encoding: { pitch: { field: "f", type: "quantitative" } }
      }
    ]
  };

  if ("data" in spec) {
    expect(spec.data.values[0].f).toBe(220);
  }
  expect(spec.config?.tempo).toBe(120);
});

// Case 6: Fully specified sequence
test("SequenceStreamSpec fully specified", () => {
  const spec: SequenceStreamSpec = {
    title: "Fully loaded sequence",
    description: "A test spec",
    datasets: [{ name: "ds1", values: [{ f: 440, x: 1 }] }],
    transform: [{ type: "filter", expr: "datum.f > 200" }],
    sequence: [
      {
        type: "tone",
        encoding: { amplitude: { field: "f", type: "quantitative" } }
      }
    ],
    tick: [{ step: 250 }],
    sampling: [{ channel: "PAN_X_chn", method: "max" }],
    synth: [{ type: "basic", gain: 0.7 }],
    wave: [{ type: "square", freq: 440 }],
    config: { tempo: 90 }
  };

  if ("datasets" in spec) {
    expect(spec.datasets).toHaveLength(1);
  }
  expect(spec.transform?.[0].type).toBe("filter");
  expect(spec.sequence).toHaveLength(1);
  expect(spec.tick?.[0].step).toBe(250);
  expect(spec.sampling?.[0].method).toBe("max");
  expect(spec.synth?.[0].gain).toBe(0.7);
  expect(spec.wave?.[0].type).toBe("square");
  expect(spec.config?.tempo).toBe(90);
});
