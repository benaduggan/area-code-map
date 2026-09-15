import { useId } from "react";
import { LOCALES, LOCALE_NAMES, useI18n } from "../../lib/i18n";
import { GlobeIcon } from "../Icons";
import "./LanguageSelect.css";

/**
 * A native select in the header. One shipped locale would make it pointless,
 * so it hides itself rather than showing a menu with nothing to choose.
 */
export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  const id = useId();
  if (LOCALES.length < 2) return null;
  return (
    <span className="pill language-pill">
      <label className="visually-hidden" htmlFor={id}>
        {t("app.language.aria")}
      </label>
      <GlobeIcon />
      <select
        id={id}
        className="language-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </span>
  );
}
