import { cleanPhoneString, extractPhoneCandidates, parseNumber } from "./phone";

describe("extractPhoneCandidates", () => {
  it("finds numbers in messy text", () => {
    const text = `Call Jane at (919) 555-0100 or +1 212.555.0199,
      Bob: 1-415-555-0123 ext 4. Order #12345 shipped. Zip 27601.`;
    expect(extractPhoneCandidates(text)).toEqual([
      "(919) 555-0100",
      "+1 212.555.0199",
      "1-415-555-0123",
    ]);
  });
});

describe("cleanPhoneString", () => {
  it("strips tel: URIs, params, and extensions", () => {
    expect(cleanPhoneString("tel:+1-919-555-0100;ext=4")).toBe("+1-919-555-0100");
    expect(cleanPhoneString("919 555 0100 x22")).toBe("919 555 0100");
    expect(cleanPhoneString("(919) 555-0100 ext. 7")).toBe("(919) 555-0100");
  });
});

describe("parseNumber", () => {
  it("normalises US numbers in many formats", () => {
    for (const raw of [
      "(919) 555-0100",
      "919-555-0100",
      "919.555.0100",
      "9195550100",
      "1 919 555 0100",
      "+1 919 555 0100",
      "+19195550100",
      "tel:+1-919-555-0100",
    ]) {
      expect(parseNumber(raw), raw).toEqual({
        kind: "nanp",
        number: { e164: "+19195550100", npa: "919" },
      });
    }
  });

  it("handles Canadian and Caribbean +1 numbers", () => {
    expect(parseNumber("416-555-0100")).toMatchObject({ kind: "nanp", number: { npa: "416" } });
    expect(parseNumber("+1 876 555 0100")).toMatchObject({ kind: "nanp", number: { npa: "876" } });
  });

  it("flags other countries", () => {
    expect(parseNumber("+44 20 7946 0958")).toEqual({ kind: "foreign", e164: "+442079460958" });
  });

  it("rejects garbage, short numbers, and unknown area codes", () => {
    expect(parseNumber("12345")).toEqual({ kind: "unrecognised" });
    expect(parseNumber("555-0100")).toEqual({ kind: "unrecognised" });
    expect(parseNumber("000-555-0100")).toEqual({ kind: "unrecognised" });
    expect(parseNumber("911")).toEqual({ kind: "unrecognised" });
  });
});
