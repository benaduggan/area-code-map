import type { ImportResult } from "../../lib/contacts";
import { HomeCodeField } from "../Home/HomeCodeField";
import { ImportPanel } from "../Import/ImportPanel";
import { InfoTip, REMEMBER_TIP } from "../InfoTip";
import { HomeIcon } from "../Icons";
import "./Welcome.css";

interface Props {
  home: string | null;
  onHomeChange: (npa: string | null) => void;
  remember: boolean;
  onRememberChange: (on: boolean) => void;
  onImport: (result: ImportResult) => void;
  onSkip: () => void;
  onOpenPrivacy: () => void;
}

export function Welcome({
  home,
  onHomeChange,
  remember,
  onRememberChange,
  onImport,
  onSkip,
  onOpenPrivacy,
}: Props) {
  return (
    <main className="welcome">
      <div className="welcome-intro">
        <section className="welcome-hero">
          <p className="welcome-tagline">Where your people started.</p>
          <p className="welcome-lead">
            Everyone you know is carrying a little piece of their history in their phone number. Add
            your contacts to see it.
          </p>
        </section>

        <section className="welcome-why" aria-label="Why this is fun">
          <ul>
            <li>
              <strong>Nobody changes their number.</strong> Most people still have the one they got
              as a teenager, so an area code says where someone started, not where they ended up.
            </li>
            <li>
              <strong>Your map lights up</strong> with every place your people are from, and the
              names behind each region are one click away.
            </li>
            <li>
              <strong>Compare with a friend.</strong> Share your map as a link or an image and see
              whose people you have in common.
            </li>
          </ul>
        </section>

        <section className="welcome-privacy" aria-labelledby="welcome-privacy-title">
          <h2 id="welcome-privacy-title">Your contacts never leave your device</h2>
          <ul>
            <li>This is a static page. There is no server, no account, and no database.</li>
            <li>
              Contacts are read in this browser tab and reduced to a count per area code. Names and
              numbers stay in memory and are gone when you close the tab.
            </li>
            <li>
              The page tells your browser to refuse connections to any other site, so even a bug
              could not upload anything.
            </li>
          </ul>
          <button type="button" className="link" onClick={onOpenPrivacy}>
            How to check this yourself
          </button>
        </section>
      </div>

      <div className="welcome-actions">
        <section className="welcome-step" aria-labelledby="welcome-home-title">
          <h2 id="welcome-home-title">
            <span className="welcome-step-icon">
              <HomeIcon />
            </span>
            Start with you
          </h2>
          <HomeCodeField value={home} onChange={onHomeChange} label="What’s your own area code?" />
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => onRememberChange(e.target.checked)}
            />
            <span>Remember this on this device</span>
            <InfoTip text={REMEMBER_TIP} />
          </label>
        </section>

        <section className="welcome-step" aria-labelledby="welcome-import-title">
          <h2 id="welcome-import-title">Then add your contacts</h2>
          <ImportPanel onImport={onImport} bare />
        </section>

        <div className="welcome-skip">
          <button type="button" className="btn" onClick={onSkip}>
            {home ? "Continue to the map" : "Skip and view the map"}
          </button>
          {!home && (
            <span className="welcome-skip-hint">
              You can browse and search every area code without adding anything.
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
