import "./InfoTip.css";

/** A small ⓘ with a hover/focus tooltip; the text is also read by screen readers. */
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="info-tip" tabIndex={0} role="note" aria-label={text} data-tip={text}>
      i
    </span>
  );
}
