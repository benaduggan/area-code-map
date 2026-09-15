import { useEffect, useRef, useState } from "react";
import { shareUrlFor } from "../../lib/share/codec";
import { downloadBlob, mapToPngBlob } from "../../lib/share/png";
import "./ShareBar.css";

interface Props {
  counts: ReadonlyMap<string, number>;
  caption: string;
  cards: { value: number; label: string }[];
  legend: { color: string; label: string }[];
  getSvg: () => SVGSVGElement | null;
}

export function ShareBar({ counts, caption, cards, legend, getSvg }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const url = shareUrlFor(counts);

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
      flash("Link copied.");
    } catch {
      flash("Could not access the clipboard. Select the link above and copy it.");
    }
  };

  const downloadPng = async () => {
    const svg = getSvg();
    if (!svg) return;
    setBusy(true);
    try {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
      const blob = await mapToPngBlob(svg, {
        title: "Area Code Map",
        caption,
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
      });
      downloadBlob(blob, "area-code-map.png");
      flash("Image downloaded.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Could not create the image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share">
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Share
      </button>
      <button type="button" className="btn" onClick={() => void downloadPng()} disabled={busy}>
        Download image
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
            <h2 id="share-title">Share your map</h2>
            <button
              type="button"
              className="link"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="privacy-status">
            A share link carries <strong>only how many numbers you have per area code</strong>. No
            names, no phone numbers, nothing about who your contacts are. Anyone who opens it sees
            your map and can compare it with their own.
          </p>

          <h3>Link</h3>
          <input
            className="share-url"
            type="text"
            readOnly
            value={url}
            aria-label="Share link"
            onFocus={(e) => e.currentTarget.select()}
          />
          <p className="skipped-note">
            {counts.size} area codes packed into {url.length - url.indexOf("#") - 1} characters
            after the <code>#</code>, which browsers never send to any server.
          </p>
          <div className="share-actions">
            <button type="button" className="btn btn-primary" onClick={() => void copyLink()}>
              Copy link
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => void downloadPng()}
              disabled={busy}
            >
              Download image
            </button>
          </div>
          <p className="skipped-note">
            The image shows the whole map with your stats and legend on it, rendered in your
            browser.
          </p>
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
