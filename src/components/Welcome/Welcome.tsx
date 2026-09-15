import { useState } from "react";
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

/**
 * Two screens before the map. The intro says what this is and why, with one
 * button. The setup asks for the visitor's area code and their contacts.
 * Both can be skipped straight to the map.
 */
export function Welcome(props: Props) {
  const [step, setStep] = useState<"intro" | "setup">("intro");
  return step === "intro" ? (
    <Intro
      onStart={() => setStep("setup")}
      onSkip={props.onSkip}
      onOpenPrivacy={props.onOpenPrivacy}
    />
  ) : (
    <Setup {...props} onBack={() => setStep("intro")} />
  );
}

function Intro({
  onStart,
  onSkip,
  onOpenPrivacy,
}: {
  onStart: () => void;
  onSkip: () => void;
  onOpenPrivacy: () => void;
}) {
  return (
    <main className="welcome welcome-intro">
      <p className="welcome-tagline">Where your people started.</p>
      <p className="welcome-lead">
        Everyone you know is carrying a little piece of their history in their phone number. Add
        your contacts to see it.
      </p>
      <p>
        Most people never change their number. The area code you got as a teenager follows you
        through every move, so a friend&rsquo;s number usually says where they&rsquo;re from, not
        where they live now. Put your contacts on a map and you get a picture of where everyone you
        know started out, with the names behind each place one click away. Share it, and see whose
        people you have in common.
      </p>
      <p className="welcome-privacy">
        Your contacts never leave your device. This is a static page with no server behind it.
        Numbers are reduced to a count per area code in your browser, and the page tells the browser
        to refuse any other connection.{" "}
        <button type="button" className="link" onClick={onOpenPrivacy}>
          How to check that yourself
        </button>
      </p>
      <div className="welcome-actions">
        <button type="button" className="btn btn-primary btn-large" onClick={onStart}>
          Get started
        </button>
        <button type="button" className="link" onClick={onSkip}>
          Just show me the map
        </button>
      </div>
    </main>
  );
}

function Setup({
  home,
  onHomeChange,
  remember,
  onRememberChange,
  onImport,
  onSkip,
  onBack,
}: Props & { onBack: () => void }) {
  return (
    <main className="welcome welcome-setup">
      <section className="welcome-step" aria-labelledby="welcome-home-title">
        <h2 id="welcome-home-title">
          <span className="welcome-step-icon">
            <HomeIcon />
          </span>
          Start with you
        </h2>
        <HomeCodeField
          value={home}
          onChange={onHomeChange}
          label="What’s your own area code?"
          autoFocus
        />
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
        <p className="welcome-step-note">
          They are read right here in your browser and never uploaded.
        </p>
        <ImportPanel onImport={onImport} bare />
      </section>

      <div className="welcome-actions welcome-actions-end">
        <button type="button" className="btn" onClick={onSkip}>
          {home ? "Continue to the map" : "Skip and view the map"}
        </button>
        <button type="button" className="link" onClick={onBack}>
          Back
        </button>
      </div>
    </main>
  );
}
