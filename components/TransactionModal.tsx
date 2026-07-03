"use client";

import { FiX, FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { formatRupiah } from "@/lib/format";

interface TransactionModalProps {
  onPay: (totals: { subtotal: number; discount: number; tax: number; total: number }) => void;
  onClose: () => void;
}

export default function TransactionModal({ onPay, onClose }: TransactionModalProps) {
  const items = useCartStore((s) => s.items);
  const discount = useCartStore((s) => s.discount);
  const setQty = useCartStore((s) => s.setQty);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const clear = useCartStore((s) => s.clear);
  const taxPercent = useSettingsStore((s) => s.settings.taxPercent);
  const counter = useTransactionStore((s) => s.counter);

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  const tax = Math.round((subtotal - discount) * (taxPercent / 100));
  const total = Math.max(0, subtotal - discount + tax);

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 sm:items-center sm:p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="anim-scale-in flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-panel sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream-100 px-5 py-4">
          <div className="text-lg font-extrabold">Pesanan #{counter + 1}</div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clear}
                className="anim-btn-press text-xs font-medium text-cocoa-800/40 hover:text-red-500"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="anim-btn-press flex h-8 w-8 items-center justify-center rounded-full bg-cream-100"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-sm text-cocoa-800/40">
              <FiShoppingCart size={36} className="opacity-60" />
              <p className="mt-2">
                Belum ada pesanan.
                <br />
                Pilih produk untuk memulai.
              </p>
            </div>
          )}
          {items.map((it) => (
            <div key={it.key} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cream-50 to-peach-100 text-2xl">
                {it.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{it.name}</div>
                {it.variantText && (
                  <div className="truncate text-xs text-cocoa-800/45">
                    {it.variantText}
                  </div>
                )}
                <div className="text-sm font-bold">
                  {formatRupiah(it.unitPrice)}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setQty(it.key, it.qty - 1)}
                  className="anim-btn-press flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-500 text-accent-500 transition hover:bg-accent-500 hover:text-white"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-bold">
                  {it.qty}
                </span>
                <button
                  onClick={() => setQty(it.key, it.qty + 1)}
                  className="anim-btn-press flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-500 text-accent-500 transition hover:bg-accent-500 hover:text-white"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-cream-100 px-4 pb-4 pt-3">
          <div className="rounded-2xl bg-cream-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold">{formatRupiah(subtotal)}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-sm">
              <span className="text-cocoa-800/50">Diskon</span>
              <input
                type="number"
                min="0"
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 rounded-lg border border-cream-200 bg-white px-2 py-1 text-right text-sm outline-none focus:border-accent-400"
              />
            </div>
            {taxPercent > 0 && (
              <div className="mt-2.5 flex items-center justify-between text-sm">
                <span className="text-cocoa-800/50">Pajak ({taxPercent}%)</span>
                <span className="font-semibold">{formatRupiah(tax)}</span>
              </div>
            )}
            <div className="my-3 border-t border-dashed border-cream-300" />
            <div className="flex items-center justify-between">
              <span className="font-extrabold">Total</span>
              <span className="text-lg font-extrabold">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onPay({ subtotal, discount, tax, total })}
            disabled={items.length === 0}
            className="anim-btn-press mt-3 w-full rounded-2xl bg-cocoa-800 py-4 font-bold text-white transition hover:bg-cocoa-700 disabled:opacity-40"
          >
            Bayar · {formatRupiah(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
