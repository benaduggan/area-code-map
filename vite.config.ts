/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves project sites under /<repo>/. Set VITE_BASE to "/" when
// hosting at a custom domain.
const base = process.env.VITE_BASE ?? "/area-code-map/";

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: "es2022",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    coverage: { provider: "v8", reporter: ["text", "html"] },
  },
});
