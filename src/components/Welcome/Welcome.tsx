import { useState } from "react";
import type { ImportResult } from "../../lib/contacts";
import { useI18n } from "../../lib/i18n";
import { HomeCodeField } from "../Home/HomeCodeField";
import { ImportPanel } from "../Import/ImportPanel";
import { ExamplesMenu } from "../Examples/ExamplesMenu";
import type { ExampleId } from "../../lib/examples";
import { InfoTip } from "../InfoTip";
import { HomeIcon } from "../Icons";
import "./Welcome.css";

interface Props {
  home: string | null;
  onHomeChange: (npa: string | null) => void;
  remember: boolean;
  onRememberChange: (on: boolean) => void;
  onImport: (result: ImportResult) => void;
  onSkip: () => void;
  onLoadExample: (mine: ExampleId, theirs: ExampleId | null) => void;
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
  const { t } = useI18n();
  return (
    <main className="welcome welcome-intro">
      <p className="welcome-header">{t("app.title")}</p>
      <p className="welcome-tagline">{t("welcome.tagline")}</p>
      <p>{t("welcome.body")}</p>
      <p className="welcome-privacy">
        {t("welcome.privacy")}{" "}
        <button type="button" className="link" onClick={onOpenPrivacy}>
          {t("welcome.privacyLink")}
        </button>
      </p>
      <div className="welcome-actions">
        <button type="button" className="btn btn-primary btn-large" onClick={onStart}>
          {t("welcome.getStarted")}
        </button>
        <button type="button" className="link" onClick={onSkip}>
          {t("welcome.skip")}
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
  onLoadExample,
  onBack,
}: Props & { onBack: () => void }) {
  const { t } = useI18n();
  return (
    <main className="welcome welcome-setup">
      <section className="welcome-step" aria-labelledby="welcome-home-title">
        <h2 id="welcome-home-title">
          <span className="welcome-step-icon">
            <HomeIcon />
          </span>
          {t("welcome.step1")}
        </h2>
        <HomeCodeField
          value={home}
          onChange={onHomeChange}
          label={t("welcome.homeLabel")}
          autoFocus
        />
        <label className="remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
          />
          <span>{t("welcome.remember")}</span>
          <InfoTip text={t("tip.remember")} />
        </label>
      </section>

      <section className="welcome-step" aria-labelledby="welcome-import-title">
        <h2 id="welcome-import-title">{t("welcome.step2")}</h2>
        <ImportPanel
          onImport={onImport}
          bare
          extraAction={<ExamplesMenu onLoad={onLoadExample} />}
        />
      </section>

      <div className="welcome-actions welcome-actions-end">
        <button type="button" className="btn" onClick={onSkip}>
          {home ? t("welcome.continue") : t("welcome.skipToMap")}
        </button>
        <button type="button" className="link" onClick={onBack}>
          {t("common.back")}
        </button>
      </div>
    </main>
  );
}
