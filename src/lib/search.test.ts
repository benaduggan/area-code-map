import { searchAreaCodes } from "./search";

describe("searchAreaCodes", () => {
  it("returns nothing for an empty query", () => {
    expect(searchAreaCodes("  ")).toEqual([]);
  });
  it("matches NPA prefixes with exact matches first", () => {
    const r = searchAreaCodes("21").map((a) => a.npa);
    expect(r[0]).toBe("210");
    expect(r).toContain("212");
    expect(searchAreaCodes("212")[0]?.npa).toBe("212");
  });
  it("matches state codes and names", () => {
    expect(searchAreaCodes("NC").every((a) => a.region === "NC")).toBe(true);
    expect(searchAreaCodes("north car").every((a) => a.region === "NC")).toBe(true);
  });
  it("matches cities", () => {
    expect(searchAreaCodes("raleigh").map((a) => a.npa)).toEqual(["919", "984"]);
  });
  it("matches Canadian provinces", () => {
    expect(searchAreaCodes("ontario").map((a) => a.npa)).toContain("416");
  });
});
