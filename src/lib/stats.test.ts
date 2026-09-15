import { aggregateContacts } from "./contacts";
import { computeStats } from "./stats";

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
