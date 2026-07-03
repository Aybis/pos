"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      counter: 1000,

      addTransaction: (trx) => {
        const number = get().counter + 1;
        const record = {
          ...trx,
          id: "TRX-" + number,
          number,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          transactions: [record, ...s.transactions],
          counter: number,
        }));
        return record;
      },

      // Refund: status berubah, data asli tetap tersimpan (jejak audit)
      refundTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id
              ? { ...t, status: "REFUND", refundedAt: new Date().toISOString() }
              : t
          ),
        })),

      clearAll: () => set({ transactions: [], counter: 1000 }),
    }),
    { name: "pos-transactions" }
  )
);
