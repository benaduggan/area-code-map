import { isAreaCode } from "../areacodes";
import { compareCounts } from "../compare";
import { EXAMPLES, buildExample, examplePairs, exampleSize } from ".";

describe("examples", () => {
  it.each(EXAMPLES.map((e) => [e.id, e] as const))("%s maps a few hundred numbers", (_id, ex) => {
    const result = buildExample(ex.id);
    const size = exampleSize(ex);
    expect(size.numbers).toBeGreaterThanOrEqual(200);
    expect(size.numbers).toBeLessThanOrEqual(300);
    expect(result.summary.nanp).toBe(size.numbers);
    expect(result.counts.size).toBe(size.codes);
    expect(result.counts.get(ex.home)).toBe(ex.spread[ex.home]);
  });

  it.each(EXAMPLES.map((e) => [e.id, e] as const))("%s uses area codes in service", (_id, ex) => {
    for (const npa of Object.keys(ex.spread)) expect(isAreaCode(npa), npa).toBe(true);
    expect(isAreaCode(ex.home)).toBe(true);
    for (const count of Object.values(ex.spread)) expect(count).toBeLessThanOrEqual(100);
  });

  it("names every number so the per-area-code lists have something to show", () => {
    const result = buildExample("maya");
    const named = result.names.get("919") ?? [];
    expect(named.reduce((a, b) => a + b.count, 0)).toBe(result.counts.get("919"));
    expect(named[0]!.name).toMatch(/^\S+ \S+$/);
  });

  it("keeps the same numbers on every build", () => {
    const a = buildExample("devon");
    const b = buildExample("devon");
    expect([...b.counts]).toEqual([...a.counts]);
  });

  it("carries numbers that deliberately miss the map", () => {
    const result = buildExample("jordan");
    const { summary } = result;
    expect(summary.foreign).toBe(2);
    expect(summary.nonGeographic).toBe(2);
    expect(result.skipped.foreign.map((f) => f.country)).toEqual(["GB", "FR"]);
  });

  it("gives every pair something shared and something of its own", () => {
    for (const [a, b] of examplePairs()) {
      const c = compareCounts(buildExample(a.id).counts, buildExample(b.id).counts);
      expect(c.both.length, `${a.id}/${b.id}`).toBeGreaterThan(3);
      expect(c.mineOnly.length, `${a.id}/${b.id}`).toBeGreaterThan(3);
      expect(c.theirsOnly.length, `${a.id}/${b.id}`).toBeGreaterThan(3);
    }
  });
});
