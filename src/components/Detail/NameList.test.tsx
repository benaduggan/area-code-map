import { render } from "@testing-library/react";
import { aggregateContacts } from "../../lib/contacts";
import { NameList } from "./NameList";

const text = (r: ReturnType<typeof aggregateContacts>, npa: string) =>
  render(<NameList result={r} npa={npa} />).container.textContent;

describe("NameList", () => {
  it("adds a count for names with several numbers", () => {
    const r = aggregateContacts(
      [
        { name: "Glenn Duggan", phones: ["678-555-0100", "678-555-0101", "678-555-0102"] },
        { name: "Ann", phones: ["678-555-0103"] },
      ],
      "vcard",
    );
    expect(text(r, "678")).toBe("Ann, Glenn Duggan (3)");
  });

  it("mentions unnamed numbers", () => {
    const r = aggregateContacts(
      [
        { name: "Glenn Duggan", phones: ["678-555-0100"] },
        { name: null, phones: ["678-555-0101", "678-555-0102"] },
      ],
      "csv",
    );
    expect(text(r, "678")).toBe("Glenn Duggan, and 2 unnamed numbers");
    const pasted = aggregateContacts([{ name: null, phones: ["678-555-0100"] }], "paste");
    expect(text(pasted, "678")).toBe("1 unnamed number");
  });

  it("renders nothing for a code with no numbers", () => {
    const r = aggregateContacts([{ name: "A", phones: ["919-555-0100"] }], "paste");
    expect(render(<NameList result={r} npa="212" />).container.innerHTML).toBe("");
  });
});
