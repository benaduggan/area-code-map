import { areaCodes } from "../areacodes";
import {
  countsFromHash,
  decodeCounts,
  decodeShare,
  encodeCounts,
  encodeShare,
  shareFromHash,
} from "./codec";

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

describe("share codec with a home code", () => {
  it("writes v2 only when a home code is included", () => {
    const counts = new Map([
      ["919", 3],
      ["212", 1],
    ]);
    expect(encodeShare(counts, null)).toBe(encodeCounts(counts));
    const withHome = encodeShare(counts, "919");
    expect(withHome.startsWith("v2.")).toBe(true);
    expect(decodeShare(withHome)).toEqual({ counts, home: "919" });
    expect(decodeShare(encodeShare(counts, null))).toEqual({ counts, home: null });
  });

  it("ignores an unknown home code", () => {
    const counts = new Map([["416", 1]]);
    expect(decodeShare(encodeShare(counts, "000"))).toEqual({ counts, home: null });
  });

  it("reads a home code from a hash", () => {
    const encoded = encodeShare(new Map([["416", 7]]), "604");
    expect(shareFromHash("#" + encoded)).toEqual({ counts: new Map([["416", 7]]), home: "604" });
    expect(shareFromHash("#v2.AA")).toBeNull();
  });
});
