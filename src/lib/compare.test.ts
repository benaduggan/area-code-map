import { compareCounts } from "./compare";

describe("compareCounts", () => {
  it("classifies codes and shapes", () => {
    const c = compareCounts(
      new Map([
        ["919", 2],
        ["212", 1],
      ]),
      new Map([
        ["919", 5],
        ["312", 1],
      ]),
    );
    expect(c.both).toEqual(["919"]);
    expect(c.mineOnly).toEqual(["212"]);
    expect(c.theirsOnly).toEqual(["312"]);
    expect(c.shapeClass.get("919")).toBe("both");
    expect(c.shapeClass.get("646")).toBe("mine"); // copied polygon shares 212's footprint
    expect(c.shapeClass.get("212")).toBe("mine");
    expect(c.shapeClass.get("312")).toBe("theirs");
    expect(c.shapeClass.get("415")).toBeUndefined();
  });
});
