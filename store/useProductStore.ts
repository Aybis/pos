"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedCategories, seedProducts } from "@/lib/seed";
import { uid } from "@/lib/format";
import { Category, Product } from "@/types";

interface ProductState {
  categories: Category[];
  products: Product[];
  addCategory: (data: { name: string; icon: string }) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (data: Partial<Product>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleActive: (id: string) => void;
  duplicateProduct: (id: string) => void;
  adjustStock: (id: string, newStock: number) => void;
  consumeStock: (items: { productId: string; qty: number }[]) => void;
  restoreStock: (items: { productId: string; qty: number }[]) => void;
  resetToSeed: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,

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
            } as Product,
          ],
        })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
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

      adjustStock: (id, newStock) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, Number(newStock) || 0) } : p
          ),
        })),
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