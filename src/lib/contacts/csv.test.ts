import { parseContactsCsv } from "./csv";

describe("parseContactsCsv", () => {
  it("reads a Google Contacts export", () => {
    const text = [
      "First Name,Last Name,E-mail 1 - Value,Phone 1 - Type,Phone 1 - Value,Phone 2 - Value",
      "Jane,Doe,jane@example.com,Mobile,(919) 555-0100 ::: +1 212 555 0199,",
      "Bob,,bob@example.com,Home,,415-555-0123",
    ].join("\n");
    expect(parseContactsCsv(text)).toEqual([
      { name: "Jane Doe", phones: ["(919) 555-0100", "+1 212 555 0199"] },
      { name: "Bob", phones: ["415-555-0123"] },
    ]);
  });

  it("reads an Outlook export", () => {
    const text = 'First Name,Last Name,Mobile Phone,Home Phone\nAnn,Lee,"312-555-0100",\n';
    expect(parseContactsCsv(text)).toEqual([{ name: "Ann Lee", phones: ["312-555-0100"] }]);
  });

  it("falls back to sniffing cells when no header matches", () => {
    const text = "who,how\nJane,(919) 555-0100\nBob,none\n";
    expect(parseContactsCsv(text)).toEqual([
      { name: null, phones: ["(919) 555-0100"] },
      { name: null, phones: [] },
    ]);
  });
});
