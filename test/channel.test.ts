import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Channel, PitchChannel, TimeChannel, TapSpeedChannel, RepeatChannel,
  LoudnessChannel, PanChannel, DetuneChannel, Tick
} from "../src";

beforeEach(() => { vi.spyOn(console, "warn").mockImplementation(() => {}); });

describe("Channel basics", () => {
  it("field() marks the channel as defined", () => {
    const c = new PitchChannel();
    expect(c.defined).toBe(false);
    c.field("price", "quantitative");
    expect(c.defined).toBe(true);
    expect(c.get()).toMatchObject({ field: "price", type: "quantitative", channel: "pitch" });
  });

  it("setters are chainable (ramp/format/formatType/removeCondition/resetCondition)", () => {
    const c = new PitchChannel("x");
    expect(c.ramp("exponential")).toBe(c);
    expect(c.format(".2f")).toBe(c);
    expect(c.formatType("number")).toBe(c);
    expect(c.removeCondition(0)).toBe(c);
    expect(c.resetCondition()).toBe(c);
  });

  it("ramp(boolean) maps to linear/abrupt", () => {
    expect(new PitchChannel().ramp(false)._ramp).toBe("abrupt");
    expect(new PitchChannel().ramp(true)._ramp).toBe("linear");
  });

  it("format and formatType are serialized (regression: dropped from get())", () => {
    const c = new PitchChannel("d").format("%Y", "time");
    expect(c.toSpec()).toMatchObject({ format: "%Y", formatType: "time" });
  });

  it("value() switches the channel to static and drops field/scale", () => {
    const c = new LoudnessChannel("x", "quantitative").scale("domain", [0, 1]).value(0.5);
    expect(c.toSpec()).toEqual({ type: "static", value: 0.5, ramp: "linear" });
  });

  it("value() validates per channel", () => {
    expect(() => new PanChannel().value(2)).toThrow(TypeError);
    expect(() => new DetuneChannel().value(-1300)).toThrow(TypeError);
  });
});

describe("PitchChannel validator", () => {
  it.each(["C4", "G4", "A#3", "Bb2", "g5"])("accepts note name %s", (n) => {
    expect(new PitchChannel().validator(n)).toBe(true);
  });
  it.each(["H4", "C", "C10", -1])("rejects %s", (n) => {
    expect(new PitchChannel().validator(n)).toBe(false);
  });
});

describe("aggregate()", () => {
  it("count drops the field", () => {
    const c = new PitchChannel("x").aggregate("count");
    expect(c._field).toBeUndefined();
    expect(c._type).toBe("quantitative");
  });
  it("quantile defaults p to 0.5 and validates it", () => {
    expect(new PitchChannel("x").aggregate("quantile")._p).toBe(0.5);
    expect(() => new PitchChannel("x").aggregate("quantile", 2)).toThrow(RangeError);
  });
  it("two-field ops are rejected", () => {
    expect(() => new PitchChannel("x").aggregate("corr" as any)).toThrow(TypeError);
  });
  it("unknown ops are rejected instead of silently ignored", () => {
    expect(() => new PitchChannel("x").aggregate("nope" as any)).toThrow(TypeError);
  });
});

describe("bin()", () => {
  it.each([
    [[true], true],
    [[false], false],
    [[[0, 5, 10]], { exact: [0, 5, 10] }],
    [[20, true], { maxbins: 20, nice: true }],
    [[undefined, false, 5], { nice: false, step: 5 }],
  ])("bin(%j) -> %j", (args, expected) => {
    expect(new PitchChannel("x").bin(...(args as any[]))._bin).toEqual(expected);
  });
  it("rejects bad arguments", () => {
    expect(() => new PitchChannel("x").bin("10")).toThrow(TypeError);
  });
});

describe("scale()", () => {
  it("range and times are mutually exclusive", () => {
    const c = new PitchChannel("x").scale("range", [200, 800]).scale("times", 2);
    expect(c._scale.range).toBeUndefined();
    expect(c._scale.times).toBe(2);
  });
  it("validates range values with the channel validator", () => {
    expect(() => new PanChannel("x").scale("range", [-2, 2])).toThrow(TypeError);
  });
  it("singleTappingPosition is stored under its own key (regression: wrote to timing)", () => {
    const c = new TapSpeedChannel("x").scale("singleTappingPosition", "middle");
    expect(c._scale).toEqual({ singleTappingPosition: "middle" });
  });
  it("supports the remaining ScaleType keys (type/domainMin/rangeMax/...)", () => {
    const c = new PitchChannel("x").scale("type", "log").scale("domainMin", 1).scale("rangeMax", 1000);
    expect(c._scale).toMatchObject({ type: "log", domainMin: 1, rangeMax: 1000 });
  });
  it("time-only keys are rejected on other channels", () => {
    expect(() => new PitchChannel("x").scale("length", 5)).toThrow();
    expect(new TimeChannel("x").scale("length", 5)._scale.length).toBe(5);
  });
});

describe("conditions", () => {
  it("addConditions keeps falsy values like 0 (regression)", () => {
    const c = new LoudnessChannel().addConditions([{ test: "datum.a > 1", value: 0 }]);
    expect(c.getConditions()).toEqual([{ test: "datum.a > 1", value: 0 }]);
  });
  it("getConditions returns a copy", () => {
    const c = new LoudnessChannel().addCondition("datum.a > 1", 1);
    c.getConditions()![0].value = 0.2;
    expect(c.getConditions()![0].value).toBe(1);
  });
  it("rejects invalid tests", () => {
    expect(() => new LoudnessChannel().addCondition(42 as any, 1)).toThrow();
  });
});

describe("time channel tick()", () => {
  it("oscType is stored under oscType (regression: wrote to playAtTime0)", () => {
    const c = new TimeChannel("t").tick("oscType", "square");
    expect(c._tick).toEqual({ oscType: "square" });
  });
  it("supports band", () => {
    expect(new TimeChannel("t").tick("band", 0.1)._tick).toEqual({ band: 0.1 });
  });
  it("accepts a Tick object by reference", () => {
    expect(new TimeChannel("t").tick(new Tick("beat"))._tick).toEqual({ name: "beat" });
  });
  it("throws on non-time channels with an accurate message", () => {
    expect(() => new PitchChannel("x").tick("interval", 1)).toThrow(/time channel/);
  });
  it("throws on invalid values instead of ignoring them", () => {
    expect(() => new TimeChannel("t").tick("loudness", 3)).toThrow(TypeError);
  });
});

describe("repeat channel", () => {
  it("accepts an array field in the constructor (regression: _channel set too late)", () => {
    expect(new RepeatChannel(["a", "b"])._field).toEqual(["a", "b"]);
  });
  it("speech() only works on repeat", () => {
    expect(new RepeatChannel("a").speech(true).get().speech).toBe(true);
    expect(() => new PitchChannel("a").speech(true)).toThrow();
  });
});

describe("ChannelSpec parity setters", () => {
  it("by/sort/timeUnit/timeLevel/sustain round-trip through toSpec()", () => {
    const c = new TimeChannel("date", "temporal")
      .by(["g"]).sort("descending").timeUnit("monthShort").timeLevel("month").sustain(true);
    expect(c.toSpec()).toMatchObject({
      by: ["g"], sort: "descending", timeUnit: "monthShort", timeLevel: "month", sustain: true
    });
  });
  it("timeUnit rejects unknown units", () => {
    expect(() => new TimeChannel("d").timeUnit("fortnight" as any)).toThrow(TypeError);
  });
});

describe("set() and clone()", () => {
  it("set() copies state without clobbering methods (regression)", () => {
    const target = new PitchChannel();
    target.set(new PitchChannel("price", "quantitative").scale("domain", [0, 10]));
    expect(typeof target.field).toBe("function");
    expect(target._field).toBe("price");
    expect(target._scale.domain).toEqual([0, 10]);
    expect(target._channel).toBe("pitch");
  });

  it("clone() keeps the concrete subclass and its validator", () => {
    const c = new PanChannel("x").clone();
    expect(c).toBeInstanceOf(PanChannel);
    expect(() => c.value(5)).toThrow(TypeError);
  });

  it("clone() is deep", () => {
    const a = new PitchChannel("x").scale("domain", [0, 1]);
    const b = a.clone();
    b._scale.domain!.push(2);
    expect(a._scale.domain).toEqual([0, 1]);
  });

  it("toSpec() strips bookkeeping keys and empty scale", () => {
    const spec = new PitchChannel("x", "quantitative").toSpec();
    expect(spec).not.toHaveProperty("defined");
    expect(spec).not.toHaveProperty("channel");
    expect(spec).not.toHaveProperty("scale");
  });
});

it("base Channel works for custom channels", () => {
  const c = new Channel("x", "nominal", "myCustom");
  expect(c.get().channel).toBe("myCustom");
});

import { timeUnitDomainDefs } from "../src/types";
describe("timeUnitDomainDefs", () => {
  it("monthNumber has 12 entries (regression: had 11)", () => {
    expect(timeUnitDomainDefs.monthNumber).toHaveLength(12);
    expect(timeUnitDomainDefs.monthNumber1).toHaveLength(12);
  });
  it("monthLong uses long names (regression: duplicated monthShort)", () => {
    expect(timeUnitDomainDefs.monthLong[0]).toBe("January");
    expect(timeUnitDomainDefs.monthLong).not.toEqual(timeUnitDomainDefs.monthShort);
  });
});
