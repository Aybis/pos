"use client";

import { create } from "zustand";

// State UI kasir yang dibagi antara sidebar kategori, topbar search, dan grid.
export const useUIStore = create((set) => ({
  activeCategory: "all",
  search: "",
  setActiveCategory: (id) => set({ activeCategory: id }),
  setSearch: (v) => set({ search: v }),
}));
