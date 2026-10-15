import { test, expect } from "vitest";
import type { SequenceStreamSpec } from "../src"; // adjust path

// Case 1: Sequence with inline data
test("SequenceStreamSpec with data field", () => {
  const spec: SequenceStreamSpec = {
    title: "Simple sequence with data",
    data: { values: [{ x: 1 }, { x: 2 }] },
    sequence: [
      {
        tone: { type: "default" },
        encoding: { pitch: { field: "x", type: "quantitative" } }
      }
    ]
  };

  // Assert presence of data
  if ("data" in spec) {
    expect(spec.data).toBeDefined();
    expect(spec.data).toHaveProperty('values');
    if (spec.data && 'values' in spec.data) {
      expect(spec.data?.values?.length).toBe(2);
    }
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
        tone: { type: "default" },
        encoding: { amplitude: { field: "v", type: "quantitative" } }
      }
    ]
  };

  // Assert presence of datasets
  if ("datasets" in spec) {
    expect(spec.datasets).toHaveLength(2);
    if ("datasets" in spec && spec.datasets) {
      expect(spec.datasets[0]).toHaveProperty("values");
      if ("values" in spec.datasets[0]) {
        expect(spec.datasets[0].values[0].v).toBe(10);
      }
    }
  } else {
    throw new Error("Expected spec to use `datasets` variant");
  }
});

// Case 3: Sequence with tick + wave
test("SequenceStreamSpec with tick and wave", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with tick + wave",
    data: { values: [{ step: 1 }, { step: 2 }] },
    tick: [{ name: 'tick1', interval: 1 }, { name: 'tick2', interval: 2 }],
    wave: [{ name: "sine", real: [0, 1], imag: [0, 2] }],
    sequence: [
      {
        tone: { type: "default" },
        encoding: { pan_x: { field: "step", type: "quantitative" } }
      }
    ]
  };

  if (spec.data && 'values' in spec.data) {
    expect(spec.data.values.length).toBe(2);
  }
  expect(spec.tick?.length).toBe(2);
  expect(spec.wave?.[0].name).toBe("sine");
});

// Case 4: Sequence with sampling + synth
test("SequenceStreamSpec with sampling and synth", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with sampling and synth",
    datasets: [{ name: "ds1", values: [{ f: 440 }] }],
    sampling: [{ name: "sample1", sample: { mono: "mono.mp3" } }],
    synth: [{ name: "baseFm", type: "FM", carrierVolume: 0.5 }],
    sequence: [
      {
        tone: { type: "baseFm" },
        encoding: { pitch: { field: "f", type: "quantitative" } }
      }
    ]
  };

  if ("datasets" in spec && spec.datasets) {
    expect(spec.datasets[0]).toHaveProperty("values");
    if ("values" in spec.datasets[0]) {
      expect(spec.datasets[0].values[0].f).toBe(440);
    }
  }
  expect(spec.sampling?.[0].name).toBe("mean");
  expect(spec.sampling?.[0].sample).toHaveProperty("mono");
  expect(spec.sampling?.[0].sample.mono).toBe("mono.mp3");
  expect(spec.synth?.[0].type).toBe("FM");
});

// Case 5: Sequence with config
test("SequenceStreamSpec with config", () => {
  const spec: SequenceStreamSpec = {
    title: "Sequence with config",
    data: { values: [{ f: 220 }] },
    config: { tempo: 120 },
    sequence: [
      {
        tone: { type: "default" },
        encoding: { pitch: { field: "f", type: "quantitative" } }
      }
    ]
  };

  expect(spec.config?.tempo).toBe(120);
});
