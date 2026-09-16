import { useEffect, useRef, useState } from "react";
import { shareUrlFor } from "../../lib/share/codec";
import { useI18n } from "../../lib/i18n";
import { downloadBlob, mapToPngBlob } from "../../lib/share/png";
import "./ShareBar.css";

interface Props {
  counts: ReadonlyMap<string, number>;
  cards: { value: number; label: string }[];
  legend: { color: string; label: string }[];
  getExportRoot: () => HTMLElement | null;
  /** The user's own area code, offered as an opt-in part of the link and image. */
  home?: string | null;
}

export function ShareBar({ counts, cards, legend, getExportRoot, home }: Props) {
  const { t, tx, n } = useI18n();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [includeHome, setIncludeHome] = useState(true);
  const ref = useRef<HTMLDialogElement>(null);
  const sharedHome = home && includeHome ? home : null;
  const url = shareUrlFor(counts, sharedHome);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 3000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      flash(t("share.copied"));
    } catch {
      flash(t("share.copyFailed"));
    }
  };

  const downloadPng = async () => {
    const root = getExportRoot();
    if (!root) return;
    setBusy(true);
    try {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
      const blob = await mapToPngBlob(root, {
        title: t("app.title"),
        cards,
        legend,
        colors: {
          background: v("--map-bg", "#ffffff"),
          page: v("--bg", "#ffffff"),
          card: v("--bg-elevated", "#f1f1ec"),
          border: v("--border", "#e2e2dc"),
          text: v("--fg", "#000000"),
          muted: v("--muted", "#666666"),
        },
        exclude: sharedHome ? undefined : '[data-home="mine"]',
      });
      downloadBlob(blob, "hometowns.png");
      flash(t("share.downloaded"));
    } catch (e) {
      flash(e instanceof Error ? e.message : t("share.imageFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share">
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        {t("share.button")}
      </button>
      <button type="button" className="btn" onClick={() => void downloadPng()} disabled={busy}>
        {t("share.download")}
      </button>
      {status && !open && (
        <span className="share-status share-status-inline" role="status">
          {status}
        </span>
      )}
      <dialog
        ref={ref}
        className="privacy-dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-labelledby="share-title"
      >
        <div className="privacy-panel">
          <div className="privacy-head">
            <h2 id="share-title">{t("share.title")}</h2>
            <button
              type="button"
              className="link"
              onClick={() => setOpen(false)}
              aria-label={t("common.close")}
            >
              ✕
            </button>
          </div>
          <p className="privacy-status">
            {tx("share.explain", { only: <strong>{t("share.explain.only")}</strong> })}
          </p>

          {home && (
            <label className="share-option">
              <input
                type="checkbox"
                checked={includeHome}
                onChange={(e) => setIncludeHome(e.target.checked)}
              />
              <span>{tx("share.includeHome", { npa: <strong>{home}</strong> })}</span>
            </label>
          )}

          <h3>{t("share.linkHeading")}</h3>
          <input
            className="share-url"
            type="text"
            readOnly
            value={url}
            aria-label={t("share.linkAria")}
            onFocus={(e) => e.currentTarget.select()}
          />
          <p className="skipped-note">
            {tx("share.packed", {
              codes: n(counts.size),
              chars: n(url.length - url.indexOf("#") - 1),
              hash: <code>#</code>,
            })}
          </p>
          <div className="share-actions">
            <button type="button" className="btn btn-primary" onClick={() => void copyLink()}>
              {t("share.copy")}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => void downloadPng()}
              disabled={busy}
            >
              {t("share.download")}
            </button>
          </div>
          {home && !includeHome && <p className="skipped-note">{t("share.homeLeftOut")}</p>}
          {status && (
            <p className="share-status" role="status">
              {status}
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
