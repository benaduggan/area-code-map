import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";

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

  it("shows the codes on a clicked region", () => {
    render(<App />);
    fireEvent.click(document.querySelector('[data-shape="212"]')!);
    expect(screen.getByRole("heading", { name: "New York" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^212/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^332/ })).toBeInTheDocument();
  });
});
