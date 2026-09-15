import { useEffect, useRef } from "react";
import type { SkippedNumbers } from "../../lib/contacts";
import { countryName } from "../../lib/stats";

interface Props {
  open: boolean;
  onClose: () => void;
  skipped: SkippedNumbers;
}

const MAX_SHOWN = 300;

/** Lists the numbers an import could not place on the map. Memory only. */
export function SkippedDialog({ open, onClose, skipped }: Props) {
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
          <h2 id="skipped-title">Numbers not on the map</h2>
          <button type="button" className="link" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="privacy-status">
          These stay in this tab like everything else. They are listed so you can spot a typo or a
          number worth fixing in your contacts.
        </p>

        {skipped.foreign.length > 0 && (
          <>
            <h3>Outside North America ({skipped.foreign.length})</h3>
            <p className="skipped-note">
              Valid numbers whose country code is not +1, so they have no North American area code.
            </p>
            {groupByCountry(skipped.foreign).map((g) => (
              <div key={g.country}>
                <p className="skipped-country">
                  {g.country} ({g.items.length})
                </p>
                <List items={g.items} />
              </div>
            ))}
          </>
        )}
        {skipped.unrecognised.length > 0 && (
          <>
            <h3>Unrecognised ({skipped.unrecognised.length})</h3>
            <p className="skipped-note">
              Too short, malformed, or a +1 number whose first three digits are not an area code in
              service.
            </p>
            <List items={skipped.unrecognised} />
          </>
        )}
      </div>
    </dialog>
  );
}

function groupByCountry(
  foreign: SkippedNumbers["foreign"],
): { country: string; items: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const f of foreign) {
    const name = countryName(f.country);
    groups.set(name, [...(groups.get(name) ?? []), f.e164]);
  }
  return [...groups.entries()]
    .map(([country, items]) => ({ country, items }))
    .sort((a, b) => b.items.length - a.items.length || a.country.localeCompare(b.country));
}

function List({ items }: { items: string[] }) {
  const shown = items.slice(0, MAX_SHOWN);
  return (
    <>
      <ul className="skipped-list">
        {shown.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {items.length > shown.length && (
        <p className="skipped-note">…and {items.length - shown.length} more.</p>
      )}
    </>
  );
}
