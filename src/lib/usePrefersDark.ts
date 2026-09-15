import { useEffect, useState } from "react";

const QUERY = "(prefers-color-scheme: dark)";

export function usePrefersDark(): boolean {
  const [dark, setDark] = useState(
    () => typeof matchMedia === "function" && matchMedia(QUERY).matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return dark;
}
