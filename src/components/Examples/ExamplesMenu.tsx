import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EXAMPLES, examplePairs, exampleSize, type ExampleId } from "../../lib/examples";
import { describeHome } from "../../lib/home";
import { useI18n } from "../../lib/i18n";
import "./ExamplesMenu.css";

const CAN_POPOVER =
  typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";

interface Props {
  onLoad?: (mine: ExampleId, theirs: ExampleId | null) => void;
  onCompare?: (id: ExampleId) => void;
}

export function ExamplesMenu({ onLoad, onCompare }: Props) {
  const { t, n } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const anchor = triggerRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu) return;
    const a = anchor.getBoundingClientRect();
    const margin = 8;
    const gap = 6;

    const below = window.innerHeight - a.bottom - gap - margin;
    const above = a.top - gap - margin;
    const goBelow = below >= above;
    menu.style.maxHeight = `${Math.max(0, goBelow ? below : above)}px`;

    const m = menu.getBoundingClientRect();
    const top = goBelow ? a.bottom + gap : Math.max(margin, a.top - m.height - gap);

    const max = Math.max(margin, window.innerWidth - m.width - margin);
    const left = Math.min(Math.max(a.left, margin), max);

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }, []);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;
    if (CAN_POPOVER && !menu.matches(":popover-open")) menu.showPopover();
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    window.addEventListener("scroll", onMove, { capture: true, passive: true });
    window.addEventListener("resize", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onMove, { capture: true });
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    if (CAN_POPOVER) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    const menu = menuRef.current;
    if (CAN_POPOVER && menu?.matches(":popover-open")) menu.hidePopover();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="btn example-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {t("examples.menu")}
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="example-menu"
          role="dialog"
          aria-label={t("examples.menu")}
          popover={CAN_POPOVER ? "auto" : undefined}
          onToggle={(e) => {
            if ((e as unknown as { newState?: string }).newState === "closed") setOpen(false);
          }}
        >
          <ul className="example-menu-list">
            {EXAMPLES.map((example) => {
              const size = exampleSize(example);
              return (
                <li key={example.id}>
                  <button
                    type="button"
                    className="example-choice"
                    onClick={() => {
                      close();
                      if (onCompare) onCompare(example.id);
                      else onLoad?.(example.id, null);
                    }}
                  >
                    <span className="example-name">{t(example.nameKey)}</span>{" "}
                    <span className="example-blurb">{t(example.blurbKey)}</span>{" "}
                    <span className="example-size">
                      {t("examples.size", {
                        numbers: n(size.numbers),
                        codes: n(size.codes),
                        npa: example.home,
                        place: describeHome(example.home, t),
                      })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {onLoad && (
            <>
              <p className="example-menu-label">{t("examples.compareTitle")}</p>
              <div className="example-pairs">
                {examplePairs().map(([a, b]) => (
                  <button
                    key={`${a.id}-${b.id}`}
                    type="button"
                    className="btn btn-small"
                    onClick={() => {
                      close();
                      onLoad(a.id, b.id);
                    }}
                  >
                    {t("examples.pair", { a: t(a.nameKey), b: t(b.nameKey) })}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
