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
import "./ImportPanel.css";

interface Props {
  onImport: (result: ImportResult) => void;
  /** Shorter version shown under existing results. */
  compact?: boolean;
}

export function ImportPanel({ onImport, compact = false }: Props) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canPick = supportsContactPicker();

  const finish = (contacts: Contact[], source: ImportSource) => {
    const result = aggregateContacts(contacts, source);
    if (result.summary.numbers === 0) {
      setError("No phone numbers found in that. Try a different file or paste some numbers.");
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
      setError(e instanceof Error ? e.message : "Could not read that file.");
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
      setError(e instanceof Error ? e.message : "Could not open your contacts.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="import">
      <h2 className="panel-title">{compact ? "Add more" : "Light up your map"}</h2>
      {!compact && (
        <p className="import-lead">
          Add the phone numbers in your contacts. They are read right here in your browser and never
          uploaded.
        </p>
      )}

      <div className="import-actions">
        {canPick && (
          <button type="button" className="btn btn-primary" onClick={handlePick} disabled={busy}>
            Choose from contacts
          </button>
        )}
        <button
          type="button"
          className={"btn" + (canPick ? "" : " btn-primary")}
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          Upload a file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".vcf,.vcard,.csv,.tsv,.txt,text/vcard,text/csv,text/plain"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
          aria-label="Upload a vCard or CSV export"
        />
        <button
          type="button"
          className="btn"
          onClick={() => setPasteOpen((v) => !v)}
          disabled={busy}
        >
          Paste numbers
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
            placeholder={
              "Paste anything with phone numbers in it, e.g.\n(919) 555-0100\n+1 212 555 0199"
            }
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            aria-label="Paste phone numbers"
          />
          <button type="submit" className="btn btn-primary" disabled={!pasted.trim()}>
            Map these
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
          <summary>How do I export my contacts?</summary>
          <ul>
            <li>
              <strong>iPhone / iCloud:</strong> icloud.com → Contacts → select all → Export vCard.
            </li>
            <li>
              <strong>Google:</strong> contacts.google.com → Export → Google CSV or vCard.
            </li>
            <li>
              <strong>Android:</strong> Contacts app → Fix &amp; manage → Export to file (.vcf).
            </li>
            <li>
              <strong>Outlook:</strong> File → Open &amp; Export → Import/Export → Export to a CSV
              file.
            </li>
          </ul>
        </details>
      )}
    </section>
  );
}
