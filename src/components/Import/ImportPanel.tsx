import { useRef, useState } from "react";
import {
  aggregateContacts,
  parseContactsCsv,
  parsePastedText,
  parseVcards,
  pickContacts,
  supportsContactPicker,
  type Contact,
  type ImportResult,
  type ImportSource,
} from "../../lib/contacts";
import { useI18n, type MessageKey } from "../../lib/i18n";
import "./ImportPanel.css";

interface Props {
  onImport: (result: ImportResult) => void;
  /** Shorter version shown under existing results. */
  compact?: boolean;
  /** Buttons only: the welcome screen supplies its own heading and lead. */
  bare?: boolean;
}

/** The export instructions, so the copy stays in the dictionary. */
const HELP: {
  id: string;
  href?: string;
  label: MessageKey;
  text: MessageKey;
  link?: MessageKey;
}[] = [
  {
    id: "iphone",
    href: "https://www.icloud.com/contacts",
    label: "import.help.iphone.label",
    text: "import.help.iphone.text",
    link: "import.help.iphone.link",
  },
  {
    id: "google",
    href: "https://contacts.google.com/",
    label: "import.help.google.label",
    text: "import.help.google.text",
    link: "import.help.google.link",
  },
  {
    id: "outlook",
    href: "https://outlook.live.com/people/",
    label: "import.help.outlook.label",
    text: "import.help.outlook.text",
    link: "import.help.outlook.link",
  },
  {
    id: "android",
    label: "import.help.android.label",
    text: "import.help.android.text",
  },
];

export function ImportPanel({ onImport, compact = false, bare = false }: Props) {
  const { t } = useI18n();
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canPick = supportsContactPicker();

  const finish = (contacts: Contact[], source: ImportSource) => {
    const result = aggregateContacts(contacts, source);
    if (result.summary.numbers === 0) {
      setError(t("import.error.noNumbers"));
      return;
    }
    setError(null);
    onImport(result);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const all: Contact[] = [];
      let source: ImportSource = "csv";
      for (const file of Array.from(files)) {
        const text = await file.text();
        const name = file.name.toLowerCase();
        if (
          name.endsWith(".vcf") ||
          name.endsWith(".vcard") ||
          /BEGIN:VCARD/i.test(text.slice(0, 200))
        ) {
          source = "vcard";
          all.push(...parseVcards(text));
        } else if (name.endsWith(".csv") || name.endsWith(".txt") || name.endsWith(".tsv")) {
          all.push(...parseContactsCsv(text));
        } else {
          all.push(...parsePastedText(text));
        }
      }
      finish(all, source);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("import.error.file"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handlePick = async () => {
    setBusy(true);
    setError(null);
    try {
      const contacts = await pickContacts();
      if (contacts.length) finish(contacts, "picker");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("import.error.contacts"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={"import" + (bare ? " is-bare" : "")}>
      {!bare && (
        <h2 className="panel-title">{compact ? t("import.titleMore") : t("import.title")}</h2>
      )}
      {!compact && !bare && <p className="import-lead">{t("import.lead")}</p>}

      <div className="import-actions">
        {canPick && (
          <button
            type="button"
            className={"btn" + (compact ? "" : " btn-primary")}
            onClick={handlePick}
            disabled={busy}
          >
            {t("import.choose")}
          </button>
        )}
        <button
          type="button"
          className={"btn" + (canPick || compact ? "" : " btn-primary")}
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {t("import.upload")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".vcf,.vcard,.csv,.tsv,.txt,text/vcard,text/csv,text/plain"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
          aria-label={t("import.uploadAria")}
        />
        <button
          type="button"
          className="btn"
          onClick={() => setPasteOpen((v) => !v)}
          disabled={busy}
        >
          {t("import.paste")}
        </button>
      </div>

      {pasteOpen && (
        <form
          className="paste"
          onSubmit={(e) => {
            e.preventDefault();
            finish(parsePastedText(pasted), "paste");
          }}
        >
          <textarea
            className="paste-input"
            rows={5}
            placeholder={t("import.pastePlaceholder")}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            aria-label={t("import.pasteAria")}
          />
          <button
            type="submit"
            className={"btn" + (compact ? "" : " btn-primary")}
            disabled={!pasted.trim()}
          >
            {t("import.mapThese")}
          </button>
        </form>
      )}

      {error && (
        <p className="import-error" role="alert">
          {error}
        </p>
      )}

      {!compact && (
        <details className="import-help">
          <summary>{t("import.help.summary")}</summary>
          <ul className="export-list">
            {HELP.map((h) => (
              <li key={h.id}>
                <span>
                  <strong>{t(h.label)}</strong> {t(h.text)}
                </span>
                {h.href && h.link && (
                  <a
                    className="btn btn-small"
                    href={h.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t(h.link)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
