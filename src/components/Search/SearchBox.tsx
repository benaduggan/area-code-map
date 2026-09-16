import { useId } from "react";
import { useI18n } from "../../lib/i18n";
import "./SearchBox.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: Props) {
  const id = useId();
  const { t } = useI18n();
  return (
    <div className="search">
      <label className="visually-hidden" htmlFor={id}>
        {t("search.label")}
      </label>
      <input
        id={id}
        className="search-input"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={t("search.placeholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
