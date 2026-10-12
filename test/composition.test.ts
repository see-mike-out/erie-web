import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Stream, Overlay, Sequence, Dataset, Tick, SynthTone, Bin, Notify
} from "../src/classes";
import * as Erie from "../src";
import { normalizeSpecification } from "../src/normalize";

beforeEach(() => { vi.spyOn(console, "warn").mockImplementation(() => { }); });

const rows = [{ a: 1, b: 2 }, { a: 2, b: 5 }, { a: 3, b: 4 }];

function basic(name = "s") {
  const s = new Stream().name(name);
  s.data.values(rows);
  s.encoding.time.field("a", "ordinal");
  s.encoding.pitch.field("b", "quantitative");
  return s;
}

describe("exports", () => {
  it.each(["Notify", "Playback", "Boxplot", "Quantile", "Diffing"])("%s is exported from the package root", (k) => {
    expect(k in Erie).toBe(true);
  });
});

describe("Stream", () => {
  it("clone keeps undefined channels so the clone stays editable (regression)", () => {
    const c = basic().clone();
    expect(() => c.encoding.loudness.value(0.5)).not.toThrow();
  });
  it("clone keeps ticks (regression)", () => {
    const s = basic();
    s.tick!.add(new Tick("beat"));
    expect(s.clone().tick!.get()).toHaveLength(1);
  });
  it("clone deep-copies notify", () => {
    const s = basic();
    s.notify!.next = new Notify().speech("next");
    const c = s.clone();
    c.notify!.next.speech("changed");
    expect(s.notify!.next.get()).toMatchObject({ speech: "next" });
  });
  it("clone is independent of the original", () => {
    const s = basic();
    const c = s.clone();
    c.encoding.pitch.field("a");
    c.data.url("x.csv");
    expect(s.encoding.pitch._field).toBe("b");
    expect(s.data.type).toBe("values");
  });
  it("toSpec emits the declarative spec shape", () => {
    expect(basic().title("T").toSpec()).toMatchObject({
      name: "s",
      title: "T",
      data: { values: rows },
      tone: { type: "default" },
      encoding: {
        time: { field: "a", type: "ordinal" },
        pitch: { field: "b", type: "quantitative" }
      }
    });
  });
  it("toSpec only emits defined channels, without bookkeeping keys", () => {
    const enc = basic().toSpec().encoding;
    expect(Object.keys(enc).sort()).toEqual(["pitch", "time"]);
    expect(enc.pitch).not.toHaveProperty("defined");
  });
  it("toSpec omits empty resource lists", () => {
    const spec: any = basic().toSpec();
    for (const k of ["tick", "synth", "sampling", "wave", "transform", "datasets"]) expect(spec).not.toHaveProperty(k);
  });
  it("toSpec throws when data is unset", () => {
    expect(() => new Stream().toSpec()).toThrow(/data/);
  });
  it("playback/notify are emitted only for streaming streams", () => {
    const s = basic();
    s.notify!.next = new Notify().speech("next");
    expect(s.toSpec()).not.toHaveProperty("playback");
    s.data.streaming(rows);
    const spec: any = s.toSpec();
    expect(spec.data).toEqual({ stream: true, test: { values: rows } });
    expect(spec.playback).toMatchObject({ init_by: "manual" });
    expect(spec.notify).toEqual({ next: { speech: "next", loudness: 1 } });
  });
  it("addChannel registers a custom channel", () => {
    const s = basic().addChannel("myFx", new Erie.Channel("b", "quantitative"));
    expect(s.toSpec().encoding.myFx).toMatchObject({ field: "b" });
  });
});

describe("Overlay / Sequence", () => {
  it("Sequence.clone returns a Sequence (regression: returned undefined)", () => {
    const seq = new Sequence(basic("a"), basic("b"));
    const c = seq.clone();
    expect(c).toBeInstanceOf(Sequence);
    expect(c.sequence).toHaveLength(2);
  });
  it("constructors accept name + varargs or name + array", () => {
    expect(new Overlay("o", basic("a"), basic("b")).overlay).toHaveLength(2);
    expect(new Sequence("q", [basic("a"), new Overlay(basic("b"))])._name).toBe("q");
  });
  it("constructors reject non-stream arguments", () => {
    expect(() => new Overlay({} as any)).toThrow(TypeError);
    expect(() => new Sequence("q", 5 as any)).toThrow(TypeError);
  });
  it("adding stores a clone (later edits to the source don't leak)", () => {
    const s = basic();
    const o = new Overlay(s);
    s.encoding.pitch.field("a");
    expect(o.stream(0).encoding.pitch._field).toBe("b");
  });
  it("hoists shared resources and dedupes them by name", () => {
    const a = basic("a"), b = basic("b");
    a.tick!.add(new Tick("beat"));
    b.tick!.add(new Tick("beat").interval(1));
    a.synth!.add(new SynthTone("fm"));
    a.datasets!.add(new Dataset("shared").set("values", rows));
    b.datasets!.add(new Dataset("shared_b").set("values", rows));
    const o = new Overlay(a, b);
    expect(o.tick!.get()).toEqual([expect.objectContaining({ name: "beat", interval: 1 })]);
    expect(o.synth!.get()).toHaveLength(1);
    expect(o.datasets!.datasets).toHaveLength(2);
    expect(o.stream(0).tick).toBeUndefined();
  });
  it("Overlay.clone keeps ticks", () => {
    const a = basic();
    a.tick!.add(new Tick("beat"));
    expect(new Overlay(a).clone().tick!.get()).toHaveLength(1);
  });
  it("Overlay.toSpec requires data or datasets", () => {
    expect(() => new Overlay(basic()).toSpec()).toThrow(/data/);
  });
  it("Sequence.toSpec nests overlays as InSeqOverlayStreamSpec", () => {
    const seq = new Sequence(basic("a"), new Overlay(basic("b"), basic("c")));
    seq.data!.values(rows);
    const spec: any = seq.toSpec();
    expect(spec.sequence[0]).toMatchObject({ name: "a" });
    expect(spec.sequence[1].overlay).toHaveLength(2);
  });
  it("skip flags are serialized", () => {
    const o = new Overlay(basic());
    o.config?.set("skipTitle", true).set("skipLength", true);
    o.data!.values(rows);
    console.log(o.config?.get())
    expect(o.toSpec().config).toMatchObject({ skipTitle: true, skipLength: true });
  });
  it("nested unit streams only carry config overrides", () => {
    const s = basic();
    s.config!.set("speechRate", 2);
    const seq = new Sequence(s, basic("plain"));
    seq.data!.values(rows);
    const spec: any = seq.toSpec();
    console.log(spec.sequence[0].config)
    expect(spec.sequence[0].config).toEqual({ speechRate: 2 });
    expect(spec.sequence[1]).not.toHaveProperty("config");
  });
});

describe("integration: class API -> normalizeSpecification", () => {
  it("get() output loses the data (documents the original bug)", async () => {
    const n = await normalizeSpecification(basic().get() as any);
    expect(Object.keys(n.datasets)).toHaveLength(0);
  });

  it("Stream.toSpec() keeps the data", async () => {
    const n = await normalizeSpecification(basic().toSpec() as any);
    const ds = Object.values(n.datasets) as any[];
    expect(ds).toHaveLength(1);
    expect(ds[0].values).toEqual(rows);
  });

  it("Stream.toSpec() with a transform normalizes", async () => {
    const s = basic();
    s.transform!.add(new Bin("b"));
    await expect(normalizeSpecification(s.toSpec() as any)).resolves.toBeDefined();
  });

  it("Overlay.toSpec() with datasets normalizes without a 'null' dataset", async () => {
    const a = basic("a"), b = basic("b");
    a.data.set("d1"); b.data.set("d1");
    a.datasets!.add(new Dataset("d1").set("values", rows));
    const n = await normalizeSpecification(new Overlay(a, b).toSpec() as any);
    expect(Object.keys(n.datasets)).not.toContain("null");
    expect(Object.keys(n.datasets)).toContain("d1");
  });

  it("Sequence.toSpec() normalizes", async () => {
    const seq = new Sequence(basic("a"), basic("b"));
    seq.data?.set("values", rows);
    const n = await normalizeSpecification(seq.toSpec() as any);
    expect(n.normalized.length).toBeGreaterThan(0);
  });
});
