import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      toggle: () => {
        const next = get().mode === "dark" ? "light" : "dark";
        document.documentElement.className = next;
        set({ mode: next });
      },
      setMode: (mode: ThemeMode) => {
        document.documentElement.className = mode;
        set({ mode });
      },
    }),
    { name: "courier-theme" }
  )
);
