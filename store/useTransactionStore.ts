"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction } from "@/types";

interface TransactionState {
  transactions: Transaction[];
  counter: number;
  addTransaction: (trx: Omit<Transaction, "id" | "number" | "createdAt">) => Transaction;
  refundTransaction: (id: string) => void;
  clearAll: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      counter: 1000,

      addTransaction: (trx) => {
        const number = get().counter + 1;
        const record: Transaction = {
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