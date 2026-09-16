import { aggregateContacts } from "./contacts";
import { computeHomeStats, computeStats } from "./stats";

describe("computeStats", () => {
  it("counts foreign countries alongside North American ones", () => {
    const r = aggregateContacts(
      [
        { name: "A", phones: ["919-555-0100", "416-555-0100"] },
        { name: "B", phones: ["+44 20 7946 0958", "+44 20 7946 0959", "+49 30 901820"] },
      ],
      "paste",
    );
    const s = computeStats(r);
    expect(s.countries).toBe(4); // US, CA, GB, DE
    expect(s.foreignCountries).toEqual([
      { code: "GB", country: "United Kingdom", count: 2 },
      { code: "DE", country: "Germany", count: 1 },
    ]);
  });
});

describe("home stats", () => {
  const result = aggregateContacts(
    [
      { name: "A", phones: ["919-555-0100"] },
      { name: "B", phones: ["984-555-0100"] }, // overlays 919
      { name: "C", phones: ["212-555-0100"] },
      { name: "D", phones: ["415-555-0100"] },
    ],
    "paste",
  );

  it("counts numbers from the home overlay complex", () => {
    const s = computeHomeStats(result, "919");
    expect(s.fromHome).toBe(2);
    expect(s.fromHomeShare).toBeCloseTo(0.5);
    expect(s.farthest?.npa).toBe("415");
    expect(s.farthestMiles).toBeGreaterThan(2000);
  });

  it("copes with an unknown home code", () => {
    const s = computeHomeStats(result, "000");
    expect(s.fromHome).toBe(0);
    expect(s.farthest).toBeNull();
  });
});
