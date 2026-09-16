import { useEffect, useRef } from "react";
import type { SkippedNumbers } from "../../lib/contacts";
import { countryName } from "../../lib/stats";
import { useI18n } from "../../lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  skipped: SkippedNumbers;
}

const MAX_SHOWN = 300;

/** Lists the numbers an import could not place on the map. Memory only. */
export function SkippedDialog({ open, onClose, skipped }: Props) {
  const { t, n, locale } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="privacy-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="skipped-title"
    >
      <div className="privacy-panel">
        <div className="privacy-head">
          <h2 id="skipped-title">{t("skipped.title")}</h2>
          <button type="button" className="link" onClick={onClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        {skipped.foreign.length > 0 && (
          <>
            <h3>{t("skipped.foreignHeading", { count: n(skipped.foreign.length) })}</h3>
            <p className="skipped-note">{t("skipped.foreignNote")}</p>
            {groupByCountry(skipped.foreign, locale, t("skipped.unknownCountry")).map((g) => (
              <div key={g.country}>
                <p className="skipped-country">
                  {t("skipped.country", { country: g.country, count: n(g.items.length) })}
                </p>
                <List items={g.items} />
              </div>
            ))}
          </>
        )}
        {skipped.nonGeographic.length > 0 && (
          <>
            <h3>{t("skipped.tollFreeHeading", { count: n(skipped.nonGeographic.length) })}</h3>
            <p className="skipped-note">{t("skipped.tollFreeNote")}</p>
            <List items={skipped.nonGeographic} />
          </>
        )}
        {skipped.unrecognised.length > 0 && (
          <>
            <h3>{t("skipped.unrecognisedHeading", { count: n(skipped.unrecognised.length) })}</h3>
            <p className="skipped-note">{t("skipped.unrecognisedNote")}</p>
            <List items={skipped.unrecognised} />
          </>
        )}
      </div>
    </dialog>
  );
}

function groupByCountry(
  foreign: SkippedNumbers["foreign"],
  locale: string,
  unknownLabel: string,
): { country: string; items: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const f of foreign) {
    const name = countryName(f.country, locale, unknownLabel);
    groups.set(name, [...(groups.get(name) ?? []), f.e164]);
  }
  return [...groups.entries()]
    .map(([country, items]) => ({ country, items }))
    .sort((a, b) => b.items.length - a.items.length || a.country.localeCompare(b.country, locale));
}

function List({ items }: { items: string[] }) {
  const { t, n } = useI18n();
  const shown = items.slice(0, MAX_SHOWN);
  return (
    <>
      <ul className="skipped-list">
        {shown.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {items.length > shown.length && (
        <p className="skipped-note">
          {t("skipped.more", { count: n(items.length - shown.length) })}
        </p>
      )}
    </>
  );
}
