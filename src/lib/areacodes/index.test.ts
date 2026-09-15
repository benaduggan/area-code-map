import { areaCodes, areaCodesForShape, displayCities, getAreaCode, isAreaCode } from ".";

describe("area code data", () => {
  it("has every code mapped to at least one shape", () => {
    expect(areaCodes.length).toBeGreaterThan(400);
    for (const a of areaCodes) expect(a.shapeIds.length).toBeGreaterThan(0);
  });

  it("looks up codes", () => {
    expect(getAreaCode("212")).toMatchObject({ region: "NY", country: "US", inService: 1947 });
    expect(isAreaCode("000")).toBe(false);
  });

  it("maps a shape back to the codes joined onto it", () => {
    // 646 and 917 were already overlays in 2010 and have their own (identical)
    // polygons, so only codes added since then are joined onto 212's shape.
    const npas = areaCodesForShape("212").map((a) => a.npa);
    expect(npas).toEqual(["212", "332"]);
    expect(getAreaCode("212")!.overlayComplex).toEqual(["212", "332", "646", "917"]);
  });

  it("falls back to sibling cities for late overlays", () => {
    expect(displayCities(getAreaCode("564")!)).toEqual(getAreaCode("206")!.cities);
  });
});
