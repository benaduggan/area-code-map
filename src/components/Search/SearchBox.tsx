import { useId } from "react";
import "./SearchBox.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="search">
      <label className="visually-hidden" htmlFor={id}>
        Search area codes
      </label>
      <input
        id={id}
        className="search-input"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder="Area code, city, or state…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
