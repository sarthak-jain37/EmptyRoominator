import { writable } from "svelte/store";
import type { Theme } from "./types";
import { browser } from "$app/environment";

const THEME_KEY = "emptyroominator-theme";

function createThemeStore() {
  const initialTheme: Theme = (browser && (localStorage.getItem(THEME_KEY) as Theme)) || "system";
  const { subscribe, set, update } = writable<Theme>(initialTheme);

  function applyTheme(theme: Theme) {
    if (!browser) return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (theme === "system" && prefersDark)) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  return {
    subscribe,
    set: (value: Theme) => {
      applyTheme(value);
      set(value);
    },
    init: () => {
      if (!browser) return;
      const stored = (localStorage.getItem(THEME_KEY) as Theme) || "system";
      applyTheme(stored);
      set(stored);

      // Listen for system changes
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        const current = (localStorage.getItem(THEME_KEY) as Theme) || "system";
        if (current === "system") {
          applyTheme("system");
        }
      });
    }
  };
}

export const theme = createThemeStore();

