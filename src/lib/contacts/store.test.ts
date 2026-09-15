import { aggregateContacts } from "./aggregate";
import {
  clearStored,
  isRememberEnabled,
  loadResult,
  saveResult,
  setRememberEnabled,
} from "./store";

afterEach(() => localStorage.clear());

describe("store", () => {
  it("does nothing unless remembering is enabled", () => {
    const r = aggregateContacts([{ name: "Jane", phones: ["919-555-0100"] }], "paste");
    saveResult(r);
    expect(loadResult()).toBeNull();
    expect(isRememberEnabled()).toBe(false);
  });

  it("round-trips counts, names and summary", () => {
    const r = aggregateContacts(
      [
        { name: "Jane", phones: ["919-555-0100", "+44 20 7946 0958"] },
        { name: "Bob", phones: ["919-555-0101"] },
      ],
      "vcard",
    );
    setRememberEnabled(true, r);
    const back = loadResult()!;
    expect(Object.fromEntries(back.counts)).toEqual({ "919": 2 });
    expect(back.names.get("919")).toEqual(["Bob", "Jane"]);
    expect(back.summary).toEqual(r.summary);
    expect(back.skipped).toEqual({ foreign: ["+442079460958"], unrecognised: [] });
  });

  it("disabling clears everything", () => {
    const r = aggregateContacts([{ name: "Jane", phones: ["919-555-0100"] }], "paste");
    setRememberEnabled(true, r);
    setRememberEnabled(false, r);
    expect(localStorage.length).toBe(0);
    setRememberEnabled(true, null);
    clearStored();
    expect(loadResult()).toBeNull();
  });
});
