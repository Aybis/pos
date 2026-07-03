"use client";

import { create } from "zustand";
import { uid } from "@/lib/format";
import { CartItem } from "@/types";

function sameLine(a: CartItem, b: Partial<CartItem>): boolean {
  return (
    a.productId === b.productId &&
    a.variantText === b.variantText &&
    (a.notes || "") === (b.notes || "")
  );
}

interface CartState {
  items: CartItem[];
  discount: number;
  addItem: (line: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  setDiscount: (value: number) => void;
  clear: () => void;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (line) =>
    set((s) => {
      const existing = s.items.find((it) => sameLine(it, line));
      if (existing) {
        return {
          items: s.items.map((it) =>
            it.key === existing.key ? { ...it, qty: it.qty + line.qty } : it
          ),
        };
      }
      return { items: [...s.items, { ...line, key: uid("line-") }] };
    }),

  setQty: (key, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((it) => it.key !== key)
          : s.items.map((it) => (it.key === key ? { ...it, qty } : it)),
    })),

  removeItem: (key) =>
    set((s) => ({ items: s.items.filter((it) => it.key !== key) })),

  setDiscount: (value) => set({ discount: Math.max(0, Number(value) || 0) }),

  clear: () => set({ items: [], discount: 0 }),

  subtotal: () =>
    get().items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0),
}));