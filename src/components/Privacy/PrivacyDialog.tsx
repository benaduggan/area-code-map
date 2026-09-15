import { useEffect, useRef } from "react";
import { useI18n } from "../../lib/i18n";
import "./PrivacyDialog.css";

interface Props {
  open: boolean;
  onClose: () => void;
  online: boolean;
}

export function PrivacyDialog({ open, onClose, online }: Props) {
  const { t, tx } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const f12 = <kbd>F12</kbd>;
  const network = <em>{t("privacy.check.network")}</em>;
  const offline = <em>{t("privacy.check.offlineOption")}</em>;

  return (
    <dialog
      ref={ref}
      className="privacy-dialog"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (outside the inner panel) closes.
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="privacy-title"
    >
      <div className="privacy-panel">
        <div className="privacy-head">
          <h2 id="privacy-title">{t("privacy.title")}</h2>
          <button type="button" className="link" onClick={onClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        <p className="privacy-status">
          {online
            ? t("privacy.status.online")
            : tx("privacy.status.offline", {
                offline: <strong>{t("privacy.status.offline.strong")}</strong>,
              })}
        </p>

        <h3>{t("privacy.contacts.heading")}</h3>
        <ul>
          <li>{t("privacy.contacts.read")}</li>
          <li>
            {tx("privacy.contacts.noServer", {
              link: (
                <a
                  href="https://github.com/benaduggan/area-code-map"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("privacy.contacts.noServer.link")}
                </a>
              ),
            })}
          </li>
          <li>{t("privacy.contacts.csp")}</li>
          <li>{tx("privacy.contacts.share", { hash: <code>#</code> })}</li>
          <li>{t("privacy.contacts.remember")}</li>
        </ul>

        <h3>{t("privacy.check.heading")}</h3>
        <p>{t("privacy.check.lead")}</p>
        <ul>
          <li>
            <strong>{t("privacy.check.any.label")}</strong> {t("privacy.check.any.text")}
          </li>
          <li>
            <strong>{t("privacy.check.chrome.label")}</strong>{" "}
            {tx("privacy.check.chrome.text", {
              f12,
              mac: <kbd>⌥⌘I</kbd>,
              network,
              offline,
            })}
          </li>
          <li>
            <strong>{t("privacy.check.firefox.label")}</strong>{" "}
            {tx("privacy.check.firefox.text", { f12, network, offline })}
          </li>
          <li>
            <strong>{t("privacy.check.safari.label")}</strong>{" "}
            {tx("privacy.check.safari.text", {
              responsive: <em>{t("privacy.check.safari.responsive")}</em>,
            })}
          </li>
        </ul>
        <p className="privacy-foot">{t("privacy.foot")}</p>
      </div>
    </dialog>
  );
}
