import { useEffect, useRef } from "react";
import "./PrivacyDialog.css";

interface Props {
  open: boolean;
  onClose: () => void;
  online: boolean;
}

export function PrivacyDialog({ open, onClose, online }: Props) {
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
        // Click on the backdrop (outside the inner panel) closes.
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="privacy-title"
    >
      <div className="privacy-panel">
        <div className="privacy-head">
          <h2 id="privacy-title">How this stays private</h2>
          <button type="button" className="link" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="privacy-status">
          {online ? (
            <>
              You are online right now. Even so, this page has made no request with your data and
              cannot: read on.
            </>
          ) : (
            <>
              <strong>You are offline</strong> and everything still works, because nothing here
              needs the network.
            </>
          )}
        </p>

        <h3>What happens to your contacts</h3>
        <ul>
          <li>
            The file or text you import is read by JavaScript running in this tab. Phone numbers are
            reduced to their area code and counted. Names are kept alongside the count so you can
            see who is where.
          </li>
          <li>
            There is no server behind this site. It is a folder of static files served by GitHub
            Pages, built from{" "}
            <a
              href="https://github.com/benaduggan/area-code-map"
              target="_blank"
              rel="noopener noreferrer"
            >
              public source code
            </a>
            .
          </li>
          <li>
            The page ships a Content-Security-Policy that tells your browser to refuse any
            connection to any other origin. Even a bug could not upload your data.
          </li>
          <li>
            A share link contains only a count per area code, and your own area code if you choose
            to include it, packed into the part of the URL after the <code>#</code>, which browsers
            never send to servers.
          </li>
          <li>
            &ldquo;Remember on this device&rdquo; writes your per-area-code counts and your own area
            code to your browser&rsquo;s local storage only. It never syncs anywhere. &ldquo;Forget
            everything&rdquo; erases it.
          </li>
        </ul>

        <h3>See for yourself: cut the network</h3>
        <p>
          No web page can switch itself offline, but you can. Do one of these, then import your
          contacts. Everything keeps working.
        </p>
        <ul>
          <li>
            <strong>Any device:</strong> turn on airplane mode. If you have opened this page before,
            it is cached and loads without a connection.
          </li>
          <li>
            <strong>Chrome or Edge:</strong> press <kbd>F12</kbd> (or <kbd>⌥⌘I</kbd> on a Mac), open
            the <em>Network</em> tab, and change the throttling dropdown from &ldquo;No
            throttling&rdquo; to <em>Offline</em>. That blocks only this tab.
          </li>
          <li>
            <strong>Firefox:</strong> press <kbd>F12</kbd>, open <em>Network</em>, and set the
            throttling dropdown to <em>Offline</em>.
          </li>
          <li>
            <strong>Safari:</strong> enable the Develop menu in Settings → Advanced, then use
            Develop → <em>Enter Responsive Design Mode</em>; or just use airplane mode.
          </li>
        </ul>
        <p className="privacy-foot">
          You can also watch the Network tab while importing: it stays empty.
        </p>
      </div>
    </dialog>
  );
}
