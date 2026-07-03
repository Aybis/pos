"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedCategories, seedProducts } from "@/lib/seed";
import { uid } from "@/lib/format";

export const useProductStore = create(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,

      // ---- Kategori ----
      addCategory: (data) =>
        set((s) => ({
          categories: [...s.categories, { id: uid("cat-"), icon: "🏷️", ...data }],
        })),
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          products: s.products.filter((p) => p.categoryId !== id),
        })),

      // ---- Produk ----
      addProduct: (data) =>
        set((s) => ({
          products: [
            ...s.products,
            {
              id: uid("p-"),
              emoji: "🍽️",
              stock: 0,
              trackStock: false,
              allowNotes: true,
              variantGroups: [],
              ...data,
            },
          ],
        })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      // Aktif/nonaktif tanpa hapus (ala "arsip" di Odoo)
      toggleActive: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id
              ? { ...p, active: p.active === false ? true : false }
              : p
          ),
        })),
      duplicateProduct: (id) =>
        set((s) => {
          const src = s.products.find((p) => p.id === id);
          if (!src) return s;
          const copy = {
            ...JSON.parse(JSON.stringify(src)),
            id: uid("p-"),
            name: src.name + " (Salinan)",
          };
          const idx = s.products.findIndex((p) => p.id === id);
          const products = [...s.products];
          products.splice(idx + 1, 0, copy);
          return { products };
        }),

      // ---- Stok ----
      adjustStock: (id, newStock) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, Number(newStock) || 0) } : p
          ),
        })),
      // Kurangi stok berdasar item transaksi
      consumeStock: (items) =>
        set((s) => ({
          products: s.products.map((p) => {
            const sold = items
              .filter((it) => it.productId === p.id)
              .reduce((sum, it) => sum + it.qty, 0);
            if (!sold || !p.trackStock) return p;
            return { ...p, stock: Math.max(0, (p.stock || 0) - sold) };
          }),
        })),

      // Kembalikan stok saat transaksi di-refund
      restoreStock: (items) =>
        set((s) => ({
          products: s.products.map((p) => {
            const returned = items
              .filter((it) => it.productId === p.id)
              .reduce((sum, it) => sum + it.qty, 0);
            if (!returned || !p.trackStock) return p;
            return { ...p, stock: (p.stock || 0) + returned };
          }),
        })),

      resetToSeed: () =>
        set({ categories: seedCategories, products: seedProducts }),
    }),
    { name: "pos-products" }
  )
);
