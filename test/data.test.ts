import { describe, it, expect } from "vitest";
import { Data, Dataset, Datasets } from "../src";

const rows = [{ a: 1, b: 2 }, { a: 2, b: 3 }];

describe("Data", () => {
  it("values() stores a deep copy and sets type 'values'", () => {
    const src = rows.map((r) => ({ ...r }));
    const d = new Data().values(src);
    src[0].a = 999;
    expect(d.type).toBe("values");
    // @ts-ignore
    expect(d.get().values?.[0].a).toBe(1);
  });

  it("url() sets type 'url' (regression: used to be 'values')", () => {
    const d = new Data().url("data/x.csv");
    expect(d.type).toBe("url");
    // @ts-ignore
    expect(d.get().url).toBe("data/x.csv");
  });

  it("url survives clone()", () => {
    const c = new Data().url("data/x.csv").clone();
    // @ts-ignore
    expect(c.get().url).toBe("data/x.csv");
  });

  it("set(dataset) keeps the dataset name (regression: name was nulled)", () => {
    const d = new Data().set(new Dataset("cars"));
    expect(d.type).toBe("name");
    // @ts-ignore
    expect(d.get().name).toBe("cars");
  });

  it("set(string) references a dataset by name", () => {
    // @ts-ignore
    expect(new Data().set("cars").toSpec()).toEqual({ name: "cars" });
  });

  it("switching sources clears the previous one", () => {
    const d = new Data().values(rows).url("x.csv");
    expect('values' in d.get()).toBeTruthy();
    // @ts-ignore
    expect(d.get().values).toBeNull();
    expect(d.toSpec()).toEqual({ url: "x.csv" });
  });

  it("rejects non-tidy data", () => {
    expect(() => new Data().values([1, 2] as any)).toThrow(TypeError);
  });

  it("accepts null-prototype rows", () => {
    const r = Object.assign(Object.create(null), { a: 1 });
    expect(() => new Data().values([r])).not.toThrow();
  });

  describe("streaming()", () => {
    it("uses inline test values", () => {
      expect(new Data().streaming(rows).toSpec()).toEqual({ stream: true, test: { values: rows } });
    });
    it("uses a test url", () => {
      expect(new Data().streaming("t.json").toSpec()).toEqual({ stream: true, test: { url: "t.json" } });
    });
    it("falls back to previously set values", () => {
      expect(new Data().values(rows).streaming().toSpec()).toEqual({ stream: true, test: { values: rows } });
    });
    it("works with no test data", () => {
      expect(new Data().streaming().toSpec()).toEqual({ stream: true });
    });
  });

  it("toSpec() never emits null keys or the internal type tag", () => {
    const spec = new Data().values(rows).toSpec()!;
    expect(Object.keys(spec)).toEqual(["values"]);
  });

  it("toSpec() is undefined when unset", () => {
    expect(() => new Data().toSpec()).toThrow(TypeError);
  });
});

describe("Dataset / Datasets", () => {
  it("Dataset.values()/url() produce DatasetSpecItem", () => {
    expect(new Dataset("a").set("values", rows).toSpec()).toEqual({ name: "a", values: rows });
    expect(new Dataset("b").set("url", "b.csv").toSpec()).toEqual({ name: "b", url: "b.csv" });
  });

  it("legacy Dataset.set('values', ...) still works", () => {
    expect(new Dataset("a").set("values", rows).toSpec()).toEqual({ name: "a", values: rows });
  });

  it("an empty Dataset cannot be serialized", () => {
    expect(() => new Dataset("a").toSpec()).toThrow(TypeError);
  });

  it("Datasets.get(name) returns undefined for unknown names instead of throwing", () => {
    expect(new Datasets().get("nope")).toBeUndefined();
  });

  it("Datasets.add() stores a copy and replaces same-named entries", () => {
    const ds = new Dataset("a").set("values", rows);
    const list = new Datasets().add(ds);
    ds.name("renamed");
    list.add(new Dataset("b").set("url", "a.csv"));
    expect(list.datasets).toHaveLength(2);
    expect(list.toSpec()).toEqual([{ name: "a", values: rows }, { name: "b", url: "a.csv" }]);
  });
});
