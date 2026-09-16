import { aggregateContacts } from "./aggregate";
import {
  clearStored,
  isRememberEnabled,
  loadHome,
  loadResult,
  saveHome,
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
    expect(back.names.get("919")).toEqual([
      { name: "Bob", count: 1 },
      { name: "Jane", count: 1 },
    ]);
    expect(back.summary).toEqual(r.summary);
    expect(back.skipped).toEqual({
      foreign: [{ e164: "+442079460958", country: "GB" }],
      unrecognised: [],
      nonGeographic: [],
    });
  });

  it("reads names saved by the older string-only format", () => {
    localStorage.setItem("area-code-map:remember", "1");
    localStorage.setItem(
      "area-code-map:import:v2",
      JSON.stringify({ counts: { "919": 2 }, names: { "919": ["Ann"] }, savedAt: "x" }),
    );
    expect(loadResult()!.names.get("919")).toEqual([{ name: "Ann", count: 1 }]);
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

  it("remembers the home area code only while remembering is on", () => {
    saveHome("919");
    expect(loadHome()).toBeNull();
    setRememberEnabled(true, null, "919");
    expect(loadHome()).toBe("919");
    saveHome("bad");
    expect(loadHome()).toBeNull();
    saveHome("312");
    setRememberEnabled(false, null);
    expect(loadHome()).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it("forgetting clears the home area code too", () => {
    setRememberEnabled(true, null, "919");
    clearStored();
    expect(loadHome()).toBeNull();
  });
});
