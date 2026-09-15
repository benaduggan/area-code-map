import { makeCountScale } from "./choropleth";

describe("makeCountScale", () => {
  it("uses unit classes for small maxima", () => {
    const s = makeCountScale([1, 3, 2]);
    expect(s.breaks).toEqual([1, 2, 3, 4]);
    expect(s.labels).toEqual(["1", "2", "3", "4", "5+"]);
    expect(s.classFor(0)).toBe(-1);
    expect(s.classFor(1)).toBe(0);
    expect(s.classFor(3)).toBe(2);
    expect(s.classFor(99)).toBe(4);
  });

  it("spaces breaks logarithmically for large maxima", () => {
    const s = makeCountScale([1, 5, 240]);
    expect(s.breaks).toEqual([3, 9, 27, 80]);
    expect(s.labels).toEqual(["1–3", "4–9", "10–27", "28–80", "81+"]);
    expect(s.classFor(240)).toBe(4);
    expect(s.classFor(4)).toBe(1);
  });

  it("keeps breaks strictly increasing", () => {
    const s = makeCountScale([7]);
    expect(s.breaks).toEqual([1, 2, 3, 5]);
  });
});
