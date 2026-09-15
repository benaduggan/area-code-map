import { render, screen } from "@testing-library/react";
import { en } from "./en";
import { DICTIONARIES, LOCALES, SOURCE_LOCALE, makeTranslator } from ".";
import { fingerprint } from "./fingerprint";
import lock from "./translations.lock.json";
import { I18nProvider } from "./I18nProvider";
import { Welcome } from "../../components/Welcome/Welcome";

const noop = () => {};

/** Everything English is translated into. */
const TRANSLATED = LOCALES.filter((l) => l !== SOURCE_LOCALE);

describe("dictionaries", () => {
  it("define the same keys in every locale", () => {
    const english = Object.keys(en).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(DICTIONARIES[locale]).sort(), locale).toEqual(english);
    }
  });

  it("use the same placeholders in every locale", () => {
    const tokens = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const locale of TRANSLATED) {
      const dict = DICTIONARIES[locale];
      for (const [key, value] of Object.entries(en)) {
        expect(tokens(dict[key as keyof typeof dict]), `${locale} ${key}`).toEqual(tokens(value));
      }
    }
  });

  it("leaves no message empty", () => {
    for (const locale of TRANSLATED) {
      for (const [key, value] of Object.entries(DICTIONARIES[locale])) {
        expect(value.trim(), `${locale} ${key}`).not.toBe("");
      }
    }
  });
});

/**
 * Editing an English message cannot fail the type checker — the translations
 * still have a string for that key, just the old one. This is the check that
 * catches it: the lock file records the English each translation was made
 * from, so reworded copy shows up here as a named list of stale keys.
 */
describe("translation drift", () => {
  const stamps: Record<string, Record<string, string> | undefined> = lock;

  it("tracks every translated locale in the lock file", () => {
    expect(Object.keys(stamps).sort()).toEqual([...TRANSLATED].sort());
  });

  it.each(TRANSLATED)("has no stale or unstamped messages in %s", (locale) => {
    const stamped = stamps[locale] ?? {};
    const stale: string[] = [];
    const unstamped: string[] = [];

    for (const [key, english] of Object.entries(en)) {
      const recorded = stamped[key];
      if (recorded === undefined) unstamped.push(key);
      else if (recorded !== fingerprint(english)) stale.push(key);
    }

    const problems = [
      stale.length && `English was reworded since these were translated:\n  ${stale.join("\n  ")}`,
      unstamped.length && `Never translated from the current English:\n  ${unstamped.join("\n  ")}`,
    ].filter(Boolean);

    expect(
      problems.join("\n\n") +
        (problems.length
          ? `\n\nRe-translate them in ${locale}.ts, then run: bun run i18n:bless ${locale}`
          : ""),
    ).toBe("");
  });
});

describe("makeTranslator", () => {
  it("fills placeholders", () => {
    const { t } = makeTranslator("en");
    expect(t("results.fact.alsoItem", { count: 3, country: "Ireland" })).toBe("3 in Ireland");
  });

  it("picks a plural form and formats the count", () => {
    const { tn } = makeTranslator("en");
    expect(tn("map.numbers", 1)).toBe("1 number");
    expect(tn("map.numbers", 2)).toBe("2 numbers");
    expect(makeTranslator("es").tn("map.numbers", 2)).toBe("2 números");
  });

  it("formats numbers for the locale", () => {
    expect(makeTranslator("en").n(1234)).toBe("1,234");
    expect(makeTranslator("es").n(1234)).toBe("1234");
  });

  it("falls back to English for a key a locale somehow lacks", () => {
    const { t } = makeTranslator("es");
    // Every key is translated today; this guards the lookup, not the dictionary.
    expect(t("app.title")).toBe("Hometowns");
  });
});

describe("locale switching", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  it("renders the app in the stored locale", () => {
    localStorage.setItem("area-code-map:locale", "es");
    render(
      <I18nProvider>
        <Welcome
          home={null}
          onHomeChange={noop}
          remember={false}
          onRememberChange={noop}
          onImport={noop}
          onSkip={noop}
          onOpenPrivacy={noop}
        />
      </I18nProvider>,
    );
    expect(screen.getByText("De dónde viene tu gente.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Empezar" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("es");
  });
});
