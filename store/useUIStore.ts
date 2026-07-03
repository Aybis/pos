"use client";

import { create } from "zustand";

interface UIState {
  activeCategory: string;
  search: string;
  setActiveCategory: (id: string) => void;
  setSearch: (v: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeCategory: "all",
  search: "",
  setActiveCategory: (id: string) => set({ activeCategory: id }),
  setSearch: (v: string) => set({ search: v }),
}));