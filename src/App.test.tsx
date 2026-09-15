import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";
import { encodeCounts, encodeShare } from "./lib/share/codec";

afterEach(() => {
  location.hash = "";
  localStorage.clear();
});

function skipWelcome() {
  fireEvent.click(screen.getByRole("button", { name: /skip and view the map/i }));
}

function pasteNumbers(text: string) {
  fireEvent.click(screen.getByRole("button", { name: "Paste numbers" }));
  fireEvent.change(screen.getByLabelText("Paste phone numbers"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Map these" }));
}

describe("App", () => {
  it("opens on the welcome screen and skips to the map", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Hometowns" })).toBeInTheDocument();
    expect(screen.getByText("Where your people started.")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /map of north american area codes/i })).toBeNull();
    skipWelcome();
    expect(
      screen.getByRole("img", { name: /map of north american area codes/i }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll("[data-shape]").length).toBeGreaterThan(300);
    expect(screen.getByRole("heading", { name: "Light up your map" })).toBeInTheDocument();
  });

  it("marks a home area code from the welcome screen", () => {
    render(<App />);
    const field = screen.getByLabelText(/your own area code/i);
    fireEvent.change(field, { target: { value: "91x9" } });
    expect(screen.getByText("Raleigh, North Carolina")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /continue to the map/i }));
    expect(document.querySelector('[data-shape="919"]')).toHaveClass("is-home");
    expect(document.querySelector('[data-home="mine"]')).not.toBeNull();
    expect(screen.getByText("Your home")).toBeInTheDocument();
    expect(screen.getByText(/^Home:/)).toHaveTextContent("919");
  });

  it("accepts an unknown home code without mapping it", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/your own area code/i), { target: { value: "000" } });
    expect(screen.getByText(/don’t know that one yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /continue to the map/i }));
    expect(document.querySelector('[data-home="mine"]')).toBeNull();
    expect(screen.getByText(/^Home:/)).toHaveTextContent("000");
  });

  it("remembers the home code only when asked, and forgets it", () => {
    const { unmount } = render(<App />);
    fireEvent.change(screen.getByLabelText(/your own area code/i), { target: { value: "312" } });
    fireEvent.click(screen.getByLabelText(/remember this on this device/i));
    expect(localStorage.getItem("area-code-map:home")).toBe("312");
    unmount();

    render(<App />);
    // Straight to the map: something is remembered.
    expect(screen.queryByText("Where your people started.")).toBeNull();
    expect(screen.getByText(/^Home:/)).toHaveTextContent("312");
    pasteNumbers("312-555-0100, 919-555-0100");
    fireEvent.click(screen.getByRole("button", { name: "Forget everything" }));
    expect(localStorage.getItem("area-code-map:home")).toBeNull();
    expect(screen.getByText("Where your people started.")).toBeInTheDocument();
  });

  it("searches and lists results", async () => {
    render(<App />);
    skipWelcome();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "raleigh" } });
    expect(screen.getByRole("button", { name: /^919/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^984/ })).toBeInTheDocument();
  });

  it("imports pasted numbers and shows counts", () => {
    render(<App />);
    skipWelcome();
    pasteNumbers("(919) 555-0100, 919-555-0101, +1 212 555 0199, +44 20 7946 0958");
    expect(screen.getByRole("heading", { name: "Your map" })).toBeInTheDocument();
    expect(screen.getByText(/Most common:/)).toHaveTextContent("919");
    expect(screen.getByText(/outside North America/)).toBeInTheDocument();
    expect(screen.getByText(/Oldest area code you know/)).toHaveTextContent(
      "212 (New York (Manhattan), New York)",
    );
    const shape = document.querySelector('[data-shape="919"]') as SVGPathElement;
    expect(shape.style.fill).not.toBe("");
    expect((document.querySelector('[data-shape="312"]') as SVGPathElement).style.fill).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Forget everything" }));
    expect(screen.getByText("Where your people started.")).toBeInTheDocument();
  });

  it("frames stats around the home code and offers it in the share link", () => {
    render(<App />);
    skipWelcome();
    pasteNumbers("919-555-0100, 984-555-0100, 415-555-0100");
    fireEvent.click(screen.getByRole("button", { name: "Add yours" }));
    fireEvent.change(screen.getByLabelText(/your area code/i), { target: { value: "919" } });
    expect(screen.getByText(/From your home area code/)).toHaveTextContent("2 numbers, 67%");
    expect(screen.getByText(/Farthest from home/)).toHaveTextContent("415");

    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    const link = screen.getByLabelText("Share link") as HTMLInputElement;
    expect(link.value).toContain("#v2.");
    fireEvent.click(screen.getByLabelText(/is my home area code/i));
    expect(link.value).toContain("#v1.");
  });

  it("shows a shared map from the URL hash and compares after import", () => {
    location.hash =
      "#" +
      encodeCounts(
        new Map([
          ["919", 4],
          ["312", 2],
        ]),
      );
    render(<App />);
    expect(screen.getByText(/viewing someone.s shared map/i)).toBeInTheDocument();
    expect((document.querySelector('[data-shape="312"]') as SVGPathElement).style.fill).not.toBe(
      "",
    );
    pasteNumbers("919-555-0100, 212-555-0100");
    expect(screen.getByText(/Comparing with a shared map/)).toBeInTheDocument();
    expect(screen.getByText(/You both know people in/)).toHaveTextContent("1 area code: 919");
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop comparing" }));
    expect(location.hash).toBe("");
    expect(screen.queryByText(/Comparing with/)).toBeNull();
  });

  it("shows the sharer's home from a v2 link", () => {
    location.hash = "#" + encodeShare(new Map([["416", 3]]), "604");
    render(<App />);
    expect(screen.getByText(/viewing someone.s shared map/i)).toHaveTextContent(
      "They’re from 604 (Vancouver, British Columbia)",
    );
    expect(document.querySelector('[data-home="theirs"]')).not.toBeNull();
    expect(screen.getByText("Their home")).toBeInTheDocument();
  });

  it("shows the codes on a clicked region", () => {
    render(<App />);
    skipWelcome();
    fireEvent.click(document.querySelector('[data-shape="212"]')!);
    expect(screen.getByRole("heading", { name: "New York" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^212/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^332/ })).toBeInTheDocument();
  });
});
