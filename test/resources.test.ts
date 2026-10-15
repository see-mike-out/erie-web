import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Tick, TickList, SampledTone, Sampling, SynthTone, WaveTone, Tone, Notify, intNotify, Playback, Config
} from "../src";

beforeEach(() => { vi.spyOn(console, "warn").mockImplementation(() => {}); vi.spyOn(console, "error").mockImplementation(() => {}); });

describe("Tick", () => {
  it("requires a name", () => { expect(() => new Tick("")).toThrow(); });
  it("clone() copies every field (regression: lost playAtTime0)", () => {
    const t = new Tick("t").interval(1).playAtTime0(false).oscType("square").pitch(300).loudness(0.2).band(0.1);
    expect(t.clone().get()).toEqual(t.get());
  });
  it("supports TickSpec extras: band/description/sample/instrument", () => {
    expect(new Tick("t").band(0.2).description("beat").sample("k.mp3").instrument("drum").get())
      .toMatchObject({ name: "t", band: 0.2, description: "beat", sample: "k.mp3", instrument: "drum" });
  });
  it.each([
    ["interval", 0], ["pitch", -1], ["loudness", 1.5], ["band", 0],
  ])("%s(%s) throws", (k, v) => { expect(() => (new Tick("t") as any)[k](v)).toThrow(TypeError); });
  it("rejects unknown oscillator types", () => { expect(() => new Tick("t").oscType("noise" as any)).toThrow(TypeError); });
  it("TickList.clone is deep", () => {
    const l = new TickList().add(new Tick("a"));
    const c = l.clone();
    c.tick[0].pitch(999);
    expect(l.get()[0].pitch).toBe(150);
  });
});

describe("SampledTone", () => {
  it("keeps every octave key (regression: only the last survived)", () => {
    expect(new SampledTone("piano", { C3: "c3.mp3", C4: "c4.mp3" }).get().sample).toEqual({ C3: "c3.mp3", C4: "c4.mp3" });
  });
  it("supports { mono } (regression: always rejected)", () => {
    expect(new SampledTone("bell", { mono: "bell.mp3" }).get().sample).toEqual({ mono: "bell.mp3" });
  });
  it("rejects mixing mono with octave keys", () => {
    expect(() => new SampledTone("x", { mono: "a", C4: "b" } as any)).toThrow(TypeError);
  });
  it.each([{}, { D4: "x" }, { C8: "x" }])("rejects %j", (s) => {
    expect(() => new SampledTone("x", s as any)).toThrow(TypeError);
  });
  it("Sampling.clone is deep", () => {
    const s = new Sampling().add(new SampledTone("p", { C4: "a" }));
    const c = s.clone();
    c.sampling[0].setName("q");
    expect(s.get()[0].name).toBe("p");
  });
});

describe("SynthTone", () => {
  it("attackTime(0) is allowed (default value)", () => { expect(new SynthTone("s").attackTime(0).get().attackTime).toBe(0); });
  it("exposes carrierVolume/sustain/decayTime setters from SynthSpec", () => {
    expect(new SynthTone("s").carrierVolume(0.5).sustain(0.3).decayTime(0.2).get())
      .toMatchObject({ carrierVolume: 0.5, sustain: 0.3, decayTime: 0.2 });
  });
  it("validates ranges", () => {
    expect(() => new SynthTone("s").sustain(2)).toThrow(TypeError);
    expect(() => new SynthTone("s").carrierDetune(1300)).toThrow(TypeError);
    expect(() => new SynthTone("s").modulatorPitch(-1)).toThrow(/pitch/);
  });
  it("rejects unknown synth types", () => { expect(() => new SynthTone("s").type("XM" as any)).toThrow(TypeError); });
  it("clone round-trips", () => {
    const s = new SynthTone("s").type("AM").harmonicity(2).carrierPitch(330);
    expect(s.clone().get()).toEqual(s.get());
  });
});

describe("WaveTone", () => {
  it("real/imag must be same length >= 2", () => {
    expect(() => new WaveTone("w", { real: [0, 1], imag: [0] } as any)).toThrow(RangeError);
    expect(new WaveTone("w", { real: [0, 1], imag: [0, 0] } as any).get()).toMatchObject({ real: [0, 1], imag: [0, 0] });
  });
  it("copies input arrays", () => {
    const r = [0, 1];
    const w = new WaveTone("w").real(r);
    r.push(5);
    expect(w.get().real).toEqual([0, 1]);
  });
});

describe("Tone", () => {
  it("accepts an instrument object", () => { expect(new Tone().set(new SynthTone("fm1")).get().type).toBe("fm1"); });
  it("set() is chainable", () => { const t = new Tone(); expect(t.set("piano")).toBe(t); });
  it("serializes ToneSpec extras only when set", () => {
    expect(new Tone("piano").get()).toEqual({ type: "piano", continued: false, filter: [] });
    expect(new Tone().hasBaseTone(true).sustain(true).baseToneAsTick("beat").tickInterval(0.5).get())
      .toMatchObject({ hasBaseTone: true, sustain: true, baseToneAsTick: "beat", tickInterval: 0.5 });
  });
  it("addFilter accepts string and string[], rejects others", () => {
    expect(new Tone().addFilter("a").addFilter(["b", "c"]).get().filter).toEqual(["a", "b", "c"]);
    expect(() => new Tone().addFilter(1 as any)).toThrow(TypeError);
  });
  it("clone doesn't share filters", () => {
    const t = new Tone().addFilter("a");
    t.clone().addFilter("b");
    expect(t.get().filter).toEqual(["a"]);
  });
});

describe("Notify", () => {
  it("speech notifications serialize without undefined keys", () => {
    expect(new Notify().speech("hi").speechRate(1.2).pause(0.5).get())
      .toEqual({ speech: "hi", loudness: 1, speechRate: 1.2, pause: 0.5 });
  });
  it("speech type without text returns true (use default speech)", () => {
    expect(new Notify("speech").get()).toBe(true);
  });
  it("sampling notifications use `sample`, not `chime` (regression)", () => {
    const g = new Notify("sampling").sample("ding.mp3").detune(-100).get() as any;
    expect(g).toEqual({ sample: "ding.mp3", loudness: 1, detune: -100 });
    expect(g).not.toHaveProperty("chime");
  });
  it("unset notify returns undefined", () => { expect(new Notify().get()).toBeUndefined(); });
  it("intNotify covers every NotifyType", () => {
    expect(Object.keys(intNotify()).sort()).toEqual(
      ["afterPlay", "afterPlayback", "beforePlay", "beforePlayback", "incoming", "next"]
    );
  });
  it("chime() is ignored for non-chime notifications", () => {
    expect(new Notify("speech").chime("anything").get()).toBe(true);
  });
});

describe("Playback", () => {
  it("condition() sets the condition, not the unit (regression)", () => {
    const g = new Playback().condition("datum.v > 10").get();
    expect(g.condition).toBe("datum.v > 10");
    expect(g.init_by).toBe("conditional");
    expect(g.unit).toBe("instance");
  });
  it("switching away from conditional clears the condition", () => {
    expect(new Playback().condition("x").init_by("manual").get().condition).toBeUndefined();
  });
  it("rejects bad limit/speed", () => {
    const p = new Playback().limit(-1).speed(-1).get();
    expect(p.limit).toBe(3);
    expect(p.speed).toBe(1.5);
  });
  it("clone round-trips", () => {
    const p = new Playback().unit("datum").condition("x").limit(5).speed(2).instrument("piano");
    expect(p.clone().get()).toEqual(p.get());
  });
});

describe("Config", () => {
  it("validates known keys", () => {
    expect(() => new Config().set("speechRate", 0)).toThrow(TypeError);
    expect(() => new Config().set("skipTitle", "yes")).toThrow(TypeError);
  });
  it("accepts ScaleConsistencyRecord (ConfigSpec)", () => {
    expect(new Config().set("overlayScaleConsistency", { pitch: true, time: false }).get().overlayScaleConsistency)
      .toEqual({ pitch: true, time: false });
  });
  it("validates timeUnit", () => {
    expect(new Config().set("timeUnit", { unit: "beat", tempo: 120 }).get().timeUnit).toEqual({ unit: "beat", tempo: 120 });
    expect(() => new Config().set("timeUnit", { unit: "minute" })).toThrow(TypeError);
  });
  it("is isolated from caller mutation and clones independently", () => {
    const rec = { pitch: true };
    const c = new Config().set("overlayScaleConsistency", rec);
    rec.pitch = false;
    const d = c.clone().set("speechRate", 2);
    expect(c.get().overlayScaleConsistency).toEqual({ pitch: true });
    expect(d.get().speechRate).toBe(2);
  });
});
