"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedSettings } from "@/lib/seed";

export const useSettingsStore = create(
  persist(
    (set) => ({
      settings: seedSettings,
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),
    }),
    { name: "pos-settings" }
  )
);
