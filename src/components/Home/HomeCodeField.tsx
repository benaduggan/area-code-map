import { useId, useState } from "react";
import { describeHome } from "../../lib/home";
import { useI18n } from "../../lib/i18n";
import "./HomeCodeField.css";

interface Props {
  value: string | null;
  onChange: (npa: string | null) => void;
  /** Focus the input when it appears. */
  autoFocus?: boolean;
  /** Optional heading rendered as the label. */
  label?: string;
}

/**
 * A three-digit area code input. Commits as soon as three digits are typed,
 * clears when the field is emptied, and confirms the place under the field.
 */
export function HomeCodeField({ value, onChange, autoFocus, label }: Props) {
  const id = useId();
  const { t } = useI18n();
  const [draft, setDraft] = useState(value ?? "");

  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    setDraft(digits);
    if (digits.length === 3) onChange(digits);
    else if (value) onChange(null);
  };

  const committed = draft.length === 3 ? draft : null;

  return (
    <div className="home-field">
      <label className="home-label" htmlFor={id}>
        {label ?? t("home.fieldLabel")}
      </label>
      <div className="home-row">
        <input
          id={id}
          className="home-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]{3}"
          maxLength={3}
          placeholder="919"
          value={draft}
          autoFocus={autoFocus}
          onChange={(e) => handle(e.target.value)}
          aria-describedby={`${id}-hint`}
        />
        <span id={`${id}-hint`} className="home-hint" aria-live="polite">
          {committed ? describeHome(committed, t) : t("home.fieldHint")}
        </span>
      </div>
    </div>
  );
}
