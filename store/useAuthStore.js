"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Login sederhana berbasis peran: "admin" atau "pegawai".
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { name, role }
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "pos-auth" }
  )
);
