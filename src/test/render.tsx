import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nProvider } from "../lib/i18n/I18nProvider";

/**
 * Components read their copy from the i18n context, so every test renders
 * inside the provider. jsdom reports `en-US`, so assertions stay in English.
 */
export function renderWithI18n(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => <I18nProvider>{children}</I18nProvider>,
    ...options,
  });
}
