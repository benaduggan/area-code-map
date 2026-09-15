import { useState } from "react";
import { HomeIcon } from "../Icons";
import { describeHome } from "../../lib/home";
import { useI18n } from "../../lib/i18n";
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
  const { t, tx } = useI18n();
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
          {t("common.done")}
        </button>
      </div>
    );
  }

  return (
    <div className="home-row-summary">
      <HomeIcon className="home-glyph" />
      {home ? (
        <>
          <span>{tx("home.summary", { npa: <strong>{home}</strong> })}</span>
          <span className="home-place">{describeHome(home, t)}</span>
        </>
      ) : (
        <span className="home-place">{t("home.prompt")}</span>
      )}
      <button type="button" className="link" onClick={() => setEditing(true)}>
        {home ? t("common.change") : t("home.addYours")}
      </button>
    </div>
  );
}
