import { parseCsv, parseCsvRecords } from "./csv";

describe("parseCsv", () => {
  it("parses simple rows", () => {
    expect(parseCsv("a,b,c\n1,2,3\n")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas, quotes, and newlines", () => {
    const text = 'name,note\n"Doe, Jane","said ""hi""\nthen left"\n';
    expect(parseCsv(text)).toEqual([
      ["name", "note"],
      ["Doe, Jane", 'said "hi"\nthen left'],
    ]);
  });

  it("handles CRLF and a BOM", () => {
    expect(parseCsv("﻿a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps empty trailing fields", () => {
    expect(parseCsv("a,b,c\n1,,\n")).toEqual([
      ["a", "b", "c"],
      ["1", "", ""],
    ]);
  });
});

describe("parseCsvRecords", () => {
  it("maps rows onto the header", () => {
    expect(parseCsvRecords("x,y\n1,2\n3\n")).toEqual([
      { x: "1", y: "2" },
      { x: "3", y: "" },
    ]);
  });
});
