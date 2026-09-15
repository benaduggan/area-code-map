import { useState } from "react";
import { HomeIcon } from "../Icons";
import { describeHome } from "../../lib/home";
import { HomeCodeField } from "./HomeCodeField";

interface Props {
  home: string | null;
  onChange: (npa: string | null) => void;
}

/**
 * One line in the sidebar: "Home: 919 · Raleigh, North Carolina · Change".
 * With no home yet, offers to add one. Editing swaps in the field.
 */
export function HomeRow({ home, onChange }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="home-editor">
        <HomeCodeField
          value={home}
          onChange={(npa) => {
            onChange(npa);
            if (npa) setEditing(false);
          }}
          autoFocus
        />
        <button type="button" className="link" onClick={() => setEditing(false)}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="home-row-summary">
      <HomeIcon className="home-glyph" />
      {home ? (
        <>
          <span>
            Home: <strong>{home}</strong>
          </span>
          <span className="home-place">{describeHome(home)}</span>
        </>
      ) : (
        <span className="home-place">Mark your own area code on the map</span>
      )}
      <button type="button" className="link" onClick={() => setEditing(true)}>
        {home ? "Change" : "Add yours"}
      </button>
    </div>
  );
}
