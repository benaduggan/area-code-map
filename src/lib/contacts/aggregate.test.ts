import { aggregateContacts, mergeResults } from "./aggregate";

describe("aggregateContacts", () => {
  it("counts distinct numbers per area code and keeps names in memory", () => {
    const result = aggregateContacts(
      [
        { name: "Jane Doe", phones: ["(919) 555-0100", "919-555-0100", "+1 212 555 0199"] },
        { name: "Bob", phones: ["919 555 0111", "+44 20 7946 0958", "12345"] },
        { name: null, phones: ["416-555-0100"] },
      ],
      "paste",
    );
    expect(Object.fromEntries(result.counts)).toEqual({ "919": 2, "212": 1, "416": 1 });
    expect(result.names.get("919")).toEqual(["Bob", "Jane Doe"]);
    expect(result.names.get("416")).toBeUndefined();
    expect(result.skipped).toEqual({ foreign: ["+442079460958"], unrecognised: ["12345"] });
    expect(result.summary).toEqual({
      source: "paste",
      contacts: 3,
      numbers: 5,
      nanp: 4,
      foreign: 1,
      unrecognised: 1,
    });
  });
});

describe("mergeResults", () => {
  it("adds counts and unions names", () => {
    const a = aggregateContacts([{ name: "A", phones: ["919-555-0100"] }], "csv");
    const b = aggregateContacts([{ name: "B", phones: ["919-555-0101", "312-555-0100"] }], "vcard");
    const m = mergeResults([a, b])!;
    expect(Object.fromEntries(m.counts)).toEqual({ "919": 2, "312": 1 });
    expect(m.names.get("919")).toEqual(["A", "B"]);
    expect(m.summary.nanp).toBe(3);
    expect(mergeResults([])).toBeNull();
  });
});
