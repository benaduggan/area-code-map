import {
  buildAreaCodes,
  parseInServiceYear,
  parseNanpaCsv,
  parseOverlayComplex,
  resolveShapeIds,
  type NanpaRow,
} from "./nanpa";

const row = (over: Partial<NanpaRow>): NanpaRow => ({
  NPA_ID: "212",
  USE: "G",
  IN_SERVICE: "Y",
  IN_SERVICE_DT: "01-Jan-1947",
  LOCATION: "NY",
  COUNTRY: "US",
  OVERLAY_COMPLEX: "212/332/646/917",
  PARENT_NPA_ID: "",
  TIME_ZONE: "E",
  ...over,
});

describe("parseNanpaCsv", () => {
  it("reads the file date line and the header", () => {
    const text = "File Date,09/14/2026\nNPA_ID,USE,IN_SERVICE\n201,G,Y\n";
    const { fileDate, rows } = parseNanpaCsv(text);
    expect(fileDate).toBe("09/14/2026");
    expect(rows).toEqual([{ NPA_ID: "201", USE: "G", IN_SERVICE: "Y" }]);
  });
});

describe("parseOverlayComplex", () => {
  it("handles multiple complexes and stray whitespace", () => {
    expect(parseOverlayComplex("206/564, 360/564 ", "564")).toEqual(["206", "360", "564"]);
  });
  it("always includes self", () => {
    expect(parseOverlayComplex("", "721")).toEqual(["721"]);
  });
});

describe("parseInServiceYear", () => {
  it("extracts the year", () => {
    expect(parseInServiceYear("30-Sep-2011")).toBe(2011);
  });
});

describe("resolveShapeIds", () => {
  const shapes = new Set(["212", "718", "347", "206", "360"]);
  it("prefers the code's own shape", () => {
    expect(resolveShapeIds("212", ["212", "332", "646", "917"], shapes)).toEqual(["212"]);
  });
  it("falls back to overlay siblings", () => {
    expect(resolveShapeIds("929", ["347", "718", "917", "929"], shapes)).toEqual(["347", "718"]);
  });
  it("returns every matching sibling for a multi-complex overlay", () => {
    expect(resolveShapeIds("564", ["206", "360", "564"], shapes)).toEqual(["206", "360"]);
  });
  it("returns [] when nothing matches", () => {
    expect(resolveShapeIds("721", ["721"], shapes)).toEqual([]);
  });
});

describe("buildAreaCodes", () => {
  it("filters to in-service geographic codes and reports unmapped ones", () => {
    const rows = [
      row({}),
      row({ NPA_ID: "332", OVERLAY_COMPLEX: "212/332/646/917", IN_SERVICE_DT: "10-Jun-2017" }),
      row({ NPA_ID: "500", USE: "N", LOCATION: "" }),
      row({ NPA_ID: "999", IN_SERVICE: "N", LOCATION: "" }),
      row({
        NPA_ID: "721",
        LOCATION: "SINT MAARTEN",
        COUNTRY: "SINT MAARTEN",
        OVERLAY_COMPLEX: "",
        IN_SERVICE_DT: "30-Sep-2011",
        TIME_ZONE: "A",
      }),
    ];
    const { areaCodes, unmapped } = buildAreaCodes(rows, new Set(["212"]), {
      "212": ["New York"],
    });
    expect(areaCodes.map((a) => a.npa)).toEqual(["212", "332", "721"]);
    expect(areaCodes[0]).toMatchObject({
      region: "NY",
      regionName: "New York",
      country: "US",
      inService: 1947,
      shapeIds: ["212"],
      cities: ["New York"],
    });
    expect(areaCodes[1]?.shapeIds).toEqual(["212"]);
    expect(areaCodes[2]).toMatchObject({ country: "Sint Maarten", shapeIds: [] });
    expect(unmapped).toEqual(["721"]);
  });
});
