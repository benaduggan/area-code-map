import {
  INSETS,
  SHAPES,
  getShape,
  milesBetween,
  unionBounds,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "./model";
import { areaCodes } from "../areacodes";

describe("geo model", () => {
  it("produces a path for every shape referenced by an area code", () => {
    const referenced = new Set(areaCodes.flatMap((a) => a.shapeIds));
    for (const id of referenced) {
      const s = getShape(id);
      expect(s, `shape ${id}`).toBeDefined();
      expect(s!.path.length, `path for ${id}`).toBeGreaterThan(10);
    }
  });

  it("assigns every shape to a known inset", () => {
    const ids = new Set(INSETS.map((i) => i.id));
    for (const s of SHAPES) expect(ids.has(s.inset)).toBe(true);
    expect(SHAPES.filter((s) => s.inset === "alaska").map((s) => s.id)).toEqual(["907"]);
    expect(SHAPES.filter((s) => s.inset === "hawaii").map((s) => s.id)).toEqual(["808"]);
  });

  it("keeps inset shapes inside their frames", () => {
    for (const s of SHAPES) {
      if (s.inset === "main") continue;
      const f = INSETS.find((i) => i.id === s.inset)!.frame;
      expect(s.bounds[0][0]).toBeGreaterThanOrEqual(f.x - 1);
      expect(s.bounds[0][1]).toBeGreaterThanOrEqual(f.y - 1);
      expect(s.bounds[1][0]).toBeLessThanOrEqual(f.x + f.width + 1);
      expect(s.bounds[1][1]).toBeLessThanOrEqual(f.y + f.height + 1);
    }
  });

  it("renders main shapes at a visible size", () => {
    const tx = getShape("806")!; // Texas panhandle: a large rural code
    expect(tx.bounds[1][0] - tx.bounds[0][0]).toBeGreaterThan(40);
    expect(SHAPES.filter((s) => s.inset === "main" && s.tiny)).toEqual([]);
  });

  it("keeps the lower 48 inside the view", () => {
    for (const id of ["305", "206", "207", "619"]) {
      const s = getShape(id)!;
      expect(s.bounds[0][0]).toBeGreaterThanOrEqual(0);
      expect(s.bounds[0][1]).toBeGreaterThanOrEqual(0);
      expect(s.bounds[1][0]).toBeLessThanOrEqual(VIEW_WIDTH);
      expect(s.bounds[1][1]).toBeLessThanOrEqual(VIEW_HEIGHT);
    }
  });

  it("unions bounds for zooming", () => {
    const b = unionBounds(["212", "718"])!;
    expect(b[1][0]).toBeGreaterThan(b[0][0]);
    expect(unionBounds(["907"])).toBeNull();
  });

  it("measures great-circle distance between shapes", () => {
    // Raleigh to San Francisco is roughly 2,400 miles.
    const d = milesBetween("919", "415")!;
    expect(d).toBeGreaterThan(2200);
    expect(d).toBeLessThan(2600);
    expect(milesBetween("919", "919")).toBe(0);
    expect(milesBetween("919", "000")).toBeNull();
  });
});
