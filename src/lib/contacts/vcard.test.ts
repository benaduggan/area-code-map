import { parseVcards } from "./vcard";

describe("parseVcards", () => {
  it("parses iCloud-style 3.0 cards with groups and folded lines", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Doe;Jane;;;",
      "FN:Jane Doe",
      "item1.TEL;type=pref:(919) 555-0100",
      "TEL;type=CELL;type=VOICE:+1 212 555",
      " 0199",
      "END:VCARD",
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Smith;Bob;;;",
      "TEL;TYPE=HOME:415-555-0123",
      "END:VCARD",
    ].join("\r\n");
    expect(parseVcards(text)).toEqual([
      { name: "Jane Doe", phones: ["(919) 555-0100", "+1 212 5550199"] },
      { name: "Bob Smith", phones: ["415-555-0123"] },
    ]);
  });

  it("parses vCard 4.0 tel URIs", () => {
    const text =
      "BEGIN:VCARD\nVERSION:4.0\nFN:Ann\nTEL;VALUE=uri;TYPE=work:tel:+1-312-555-0100\nEND:VCARD\n";
    expect(parseVcards(text)).toEqual([{ name: "Ann", phones: ["tel:+1-312-555-0100"] }]);
  });

  it("decodes quoted-printable names from old Android exports", () => {
    const text =
      "BEGIN:VCARD\nVERSION:2.1\nN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:;Jos=C3=A9\nTEL;CELL:6195550100\nEND:VCARD\n";
    expect(parseVcards(text)).toEqual([{ name: "José", phones: ["6195550100"] }]);
  });

  it("ignores cards without phones gracefully", () => {
    expect(parseVcards("BEGIN:VCARD\nFN:Nobody\nEND:VCARD")).toEqual([
      { name: "Nobody", phones: [] },
    ]);
  });
});
