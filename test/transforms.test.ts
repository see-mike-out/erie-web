import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Aggregate, Bin, Boxplot, Calculate, Density, Diffing, Filter, Fold, Quantile, Transform
} from "../src/classes";

beforeEach(() => { vi.spyOn(console, "warn").mockImplementation(() => { }); });

describe("groupby (shared across transforms)", () => {
  const makers = {
    Aggregate: () => new Aggregate(),
    Boxplot: () => new Boxplot("v"),
    Calculate: () => new Calculate("datum.a * 2", "a2"),
    Diffing: () => new Diffing(["v"]),
    Quantile: () => new Quantile("v", 4),
  };
  for (const [name, make] of Object.entries(makers)) {
    describe(name, () => {
      it("accepts varargs", () => { expect((make() as any).groupby("a", "b").get().groupby).toEqual(["a", "b"]); });
      it("accepts an array", () => { expect((make() as any).groupby(["a"]).get().groupby).toEqual(["a"]); });
      it("accepts 'auto' as GroupbyType (regression: became ['auto'])", () => {
        expect((make() as any).groupby("auto").get().groupby).toBe("auto");
      });
      it("rejects invalid input", () => { expect(() => (make() as any).groupby(1)).toThrow(TypeError); });
      it("clone() does not share the groupby array", () => {
        const a = (make() as any).groupby(["a"]);
        const b = a.clone();
        b._groupby.push("z");
        expect(a.get().groupby).toEqual(["a"]);
      });
    });
  }
  it("Density only accepts field names (spec: string[])", () => {
    expect(new Density("v").groupby("g").get().groupby).toEqual(["g"]);
    expect(new Density("v").groupby("auto").get().groupby).toEqual("auto");
    expect(() => new Density("v").groupby(3)).toThrow(TypeError);
  });
});

describe("Aggregate", () => {
  it("single-field ops", () => {
    expect(new Aggregate().add("mean", "v", "m").get().aggregate).toEqual([{ op: "mean", field: "v", as: "m" }]);
  });
  it("count accepts legacy add('count', 'n') and add('count', undefined, 'n')", () => {
    expect(new Aggregate().add("count", "n").get().aggregate).toEqual([{ op: "count", as: "n" }]);
    expect(new Aggregate().add("count", undefined, "n").get().aggregate).toEqual([{ op: "count", as: "n" }]);
  });
  it("two-field ops accept two string fields (regression: inverted check)", () => {
    expect(new Aggregate().add("corr", ["a", "b"], "r").get().aggregate).toEqual([{ op: "corr", field: ["a", "b"], as: "r" }]);
  });
  it("two-field ops reject bad fields", () => {
    expect(() => new Aggregate().add("corr", ["a"], "r")).toThrow();
    expect(() => new Aggregate().add("corr", ["a", 1 as any], "r")).toThrow();
  });
  it("quantile p defaults to 0.5 and is range-checked", () => {
    expect(new Aggregate().add("quantile", "v", "q").get().aggregate[0].p).toBe(0.5);
    expect(() => new Aggregate().add("quantile", "v", "q", 1.5)).toThrow(RangeError);
  });
  it("unsupported op throws", () => {
    expect(() => new Aggregate().add("nope" as any, "v", "x")).toThrow(/Unsupported/);
  });
  it("get() returns copies", () => {
    const a = new Aggregate().add("sum", "v", "s");
    a.get().aggregate.push({ op: "max", as: "x" } as any);
    expect(a.get().aggregate).toHaveLength(1);
  });
});

describe("Bin", () => {
  it("defaults", () => {
    expect(new Bin("v").get()).toMatchObject({ bin: "v", as: "v__bin", end: "v__bin_end", nice: true, maxbins: 10 });
  });
  it.each([0, -3, 2.5])("maxbins(%s) throws", (n) => { expect(() => new Bin("v").maxbins(n)).toThrow(TypeError); });
  it("step must be positive", () => { expect(() => new Bin("v").step(0)).toThrow(TypeError); });
  it("exact() sorts and copies", () => {
    const e = [10, 0, 5];
    const b = new Bin("v").exact(e);
    e.push(99);
    expect(b.get().exact).toEqual([0, 5, 10]);
  });
  it("exact() needs at least two numbers", () => { expect(() => new Bin("v").exact([1])).toThrow(TypeError); });
});

describe("Quantile", () => {
  it("as() accepts any two strings (regression: compared to field-name length)", () => {
    expect(new Quantile("price", 4).as(["prob", "value"]).get().as).toEqual(["prob", "value"]);
  });
  it("as() rejects wrong length", () => { expect(() => new Quantile("v", 4).as(["a"] as any)).toThrow(TypeError); });
  it("step must be in (0, 1)", () => {
    expect(new Quantile("v", undefined, 0.25).get().step).toBe(0.25);
    expect(() => new Quantile("v").step(1)).toThrow(TypeError);
  });
  it("n must be a positive integer", () => { expect(() => new Quantile("v", 2.5)).toThrow(TypeError); });
  it("n or step must be given", () => {
    expect(() => { new Quantile("v") }).toThrow(TypeError);
  });
});

describe("Boxplot", () => {
  it("extent accepts numbers and 'min-max'", () => {
    expect(new Boxplot("v", 1.5).get().extent).toBe(1.5);
    expect(new Boxplot("v").extent("min-max").get().extent).toBe("min-max");
    expect(() => new Boxplot("v").extent(-1)).toThrow(TypeError);
  });
});

describe("Diffing", () => {
  it("defaults carryOver and keepFirstAsZero to true", () => {
    expect(new Diffing(["a"]).get()).toMatchObject({ carryOver: true, keepFirstAsZero: true });
  });
  it("as must match diffing length", () => {
    expect(new Diffing(["a", "b"]).as(["da", "db"]).get().as).toEqual(["da", "db"]);
    expect(() => new Diffing(["a", "b"]).as(["da"])).toThrow(TypeError);
  });
  it("constructor copies input arrays", () => {
    const f = ["a"];
    const d = new Diffing(f);
    f.push("b");
    expect(d.get().diffing).toEqual(["a"]);
  });
});

describe("Fold", () => {
  it("as() error message names 'as' (regression: said 'fold')", () => {
    expect(() => new Fold(["a"], "k").as(["x"])).toThrow(/'as'/);
  });
  it("clone is independent", () => {
    const a = new Fold(["a", "b"], "k");
    const b = a.clone().fold(["c"]);
    expect(a.get().fold).toEqual(["a", "b"]);
    expect(b.get().fold).toEqual(["c"]);
  });
});

describe("Calculate", () => {
  it("omits groupby when unset, includes it when set (CalculateSpec.groupby)", () => {
    expect(new Calculate("datum.a", "b").get()).toEqual({ calculate: "datum.a", as: "b" });
    expect(new Calculate("datum.a", "b").groupby("g").get().groupby).toEqual(["g"]);
  });
});

describe("Density", () => {
  it("extent must be an ordered pair", () => {
    expect(() => new Density("v").extent([5, 1])).toThrow(TypeError);
    expect(new Density("v").extent([1, 5]).get().extent).toEqual([1, 5]);
  });
});

describe("Transform list", () => {
  it("serializes items in order and deep-clones", () => {
    const t = new Transform().add(new Filter("datum.a > 1")).add(new Bin("a"));
    const c = t.clone();
    (c.transform[0] as Filter).filter("datum.a > 2");
    expect(t.get()[0]).toEqual({ filter: "datum.a > 1" });
    expect(c.get()[0]).toEqual({ filter: "datum.a > 2" });
    expect(t.get()).toHaveLength(2);
  });
});
