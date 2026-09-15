import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";
import { encodeCounts } from "./lib/share/codec";

afterEach(() => {
  location.hash = "";
  localStorage.clear();
});

describe("App", () => {
  it("renders the title and the map", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Area Code Map" })).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /map of north american area codes/i }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll("[data-shape]").length).toBeGreaterThan(300);
  });

  it("searches and lists results", async () => {
    render(<App />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "raleigh" } });
    expect(screen.getByRole("button", { name: /^919/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^984/ })).toBeInTheDocument();
  });

  it("imports pasted numbers and shows counts", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Paste numbers" }));
    fireEvent.change(screen.getByLabelText("Paste phone numbers"), {
      target: { value: "(919) 555-0100, 919-555-0101, +1 212 555 0199, +44 20 7946 0958" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Map these" }));
    expect(screen.getByRole("heading", { name: "Your map" })).toBeInTheDocument();
    expect(screen.getByText(/Most common:/)).toHaveTextContent("919");
    expect(screen.getByText(/outside North America/)).toBeInTheDocument();
    const shape = document.querySelector('[data-shape="919"]') as SVGPathElement;
    expect(shape.style.fill).not.toBe("");
    expect((document.querySelector('[data-shape="312"]') as SVGPathElement).style.fill).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Forget everything" }));
    expect(screen.getByRole("heading", { name: "Light up your map" })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Paste numbers" }));
    fireEvent.change(screen.getByLabelText("Paste phone numbers"), {
      target: { value: "919-555-0100, 212-555-0100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Map these" }));
    expect(screen.getByText(/Comparing with a shared map/)).toBeInTheDocument();
    expect(screen.getByText(/You both know people in/)).toHaveTextContent("1 area code: 919");
    expect(screen.getByRole("button", { name: "Copy share link" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop comparing" }));
    expect(location.hash).toBe("");
    expect(screen.queryByText(/Comparing with/)).toBeNull();
  });

  it("shows the codes on a clicked region", () => {
    render(<App />);
    fireEvent.click(document.querySelector('[data-shape="212"]')!);
    expect(screen.getByRole("heading", { name: "New York" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^212/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^332/ })).toBeInTheDocument();
  });
});
