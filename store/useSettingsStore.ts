"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedSettings } from "@/lib/seed";
import { Settings } from "@/types";

interface SettingsState {
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: seedSettings,
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),
    }),
    { name: "pos-settings" }
  )
);