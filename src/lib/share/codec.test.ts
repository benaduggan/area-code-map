import { areaCodes } from "../areacodes";
import { countsFromHash, decodeCounts, encodeCounts } from "./codec";

describe("share codec", () => {
  it("round-trips counts", () => {
    const counts = new Map([
      ["919", 3],
      ["212", 1],
      ["512", 400],
      ["876", 2],
    ]);
    const encoded = encodeCounts(counts);
    expect(encoded.startsWith("v1.")).toBe(true);
    expect(decodeCounts(encoded)).toEqual(counts);
  });

  it("is compact", () => {
    const counts = new Map(areaCodes.slice(0, 100).map((a, i) => [a.npa, (i % 7) + 1]));
    expect(encodeCounts(counts).length).toBeLessThan(300);
  });

  it("drops unknown codes and non-positive counts", () => {
    const encoded = encodeCounts(
      new Map([
        ["919", 2],
        ["000", 5],
        ["212", 0],
      ]),
    );
    expect(decodeCounts(encoded)).toEqual(new Map([["919", 2]]));
  });

  it("rejects garbage", () => {
    expect(decodeCounts("v1.!!!")).toBeNull();
    expect(decodeCounts("v2.AA")).toBeNull();
    expect(decodeCounts("")).toBeNull();
    expect(countsFromHash("#")).toBeNull();
    expect(countsFromHash("#v1." + "_".repeat(40))).toBeNull();
  });

  it("reads from a hash", () => {
    const encoded = encodeCounts(new Map([["416", 7]]));
    expect(countsFromHash("#" + encoded)).toEqual(new Map([["416", 7]]));
  });
});
