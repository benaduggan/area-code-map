import { codesOnShape, countsByShape, shapesForCode } from "./coverage";

const npas = (id: string) => codesOnShape(id).map((a) => a.npa);

describe("coverage", () => {
  it("puts a whole overlay complex on a copied polygon", () => {
    expect(npas("212")).toEqual(["212", "332", "646", "917"]);
    expect(npas("646")).toEqual(["212", "332", "646", "917"]);
  });

  it("paints a union overlay onto every polygon it spans", () => {
    expect(shapesForCode("917")).toEqual(expect.arrayContaining(["212", "646", "718", "347"]));
    expect(npas("718")).toContain("917");
    expect(npas("718")).not.toContain("212");
  });

  it("keeps geographically distinct complexes apart", () => {
    // 404 (Atlanta) and 770 (suburbs) are different complexes; 470/678/943 span both.
    expect(npas("404")).toEqual(["404", "470", "678", "943"]);
    expect(npas("770")).toEqual(["470", "678", "770", "943"]);
  });

  it("treats codes that merged into one complex as covering each other's polygons", () => {
    expect(npas("213")).toEqual(["213", "323", "738"]);
    expect(npas("323")).toEqual(["213", "323", "738"]);
  });

  it("sums counts onto shapes", () => {
    const c = countsByShape(
      new Map([
        ["212", 2],
        ["917", 1],
        ["718", 5],
      ]),
    );
    expect(c.get("212")).toBe(3);
    expect(c.get("646")).toBe(3);
    expect(c.get("718")).toBe(6);
    expect(c.get("347")).toBe(6);
    expect(c.get("312")).toBeUndefined();
  });
});
