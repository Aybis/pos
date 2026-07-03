"use client";

import { useMemo, useState } from "react";
import { FiX, FiMinus, FiPlus } from "react-icons/fi";
import { calcUnitPrice, variantLabel, formatRupiah } from "@/lib/format";
import { Product } from "@/types";

interface AddToCartModalProps {
  product: Product;
  onAdd: (qty: number, selectedOptions: Record<string, string | string[]>, notes: string, variantText: string, unitPrice: number) => void;
  onClose: () => void;
}

export default function AddToCartModal({ product, onAdd, onClose }: AddToCartModalProps) {
  const [selected, setSelected] = useState<Record<string, string | string[]>>(() => {
    const init: Record<string, string | string[]> = {};
    for (const g of product.variantGroups || []) {
      if (g.options.length === 0) continue;
      if (g.type === "single") init[g.id] = g.options[0].id;
      else if (g.required) init[g.id] = [g.options[0].id];
    }
    return init;
  });
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  const unitPrice = useMemo(
    () => calcUnitPrice(product, selected),
    [product, selected]
  );
  const variantText = useMemo(
    () => variantLabel(product, selected),
    [product, selected]
  );

  function toggle(group: Product["variantGroups"][0], optId: string) {
    setSelected((prev) => {
      if (group.type === "single") return { ...prev, [group.id]: optId };
      const curArr: string[] = Array.isArray(prev[group.id]) ? prev[group.id] as string[] : [];
      const next = curArr.includes(optId)
        ? curArr.filter((x) => x !== optId)
        : [...curArr, optId];
      if (group.required && next.length === 0) return prev;
      return { ...prev, [group.id]: next };
    });
  }

  const inputCls =
    "w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-400";

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex flex-col bg-cocoa-900/50"
      onClick={onClose}
    >
      <div
        className="anim-scale-in flex max-h-full min-h-full w-full flex-col bg-white shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream-100 px-6 py-4">
          <div className="text-lg font-bold">Tambah Pesanan</div>
          <button
            onClick={onClose}
            className="anim-btn-press flex h-9 w-9 items-center justify-center rounded-full bg-cream-100"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cream-50 to-peach-100 text-4xl">
              {product.emoji || "🍽️"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{product.name}</div>
              <div className="text-sm font-bold text-accent-600">{formatRupiah(unitPrice)}</div>
            </div>
          </div>

          {(product.variantGroups || []).length > 0 && (
            <div className="mt-5 space-y-4">
              {product.variantGroups.map((group) => (
                <div key={group.id}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-cocoa-800/50">
                    {group.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => {
                      const cur = selected[group.id];
                      const active =
                        group.type === "single"
                          ? cur === opt.id
                          : Array.isArray(cur) && cur.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggle(group, opt.id)}
                          className={`anim-btn-press rounded-xl px-3 py-2 text-xs transition ${
                            active
                              ? "bg-peach-100 font-bold text-cocoa-800 ring-1 ring-accent-500"
                              : "bg-cream-50 text-cocoa-800/60 hover:bg-cream-100"
                          }`}
                        >
                          {opt.name}
                          {opt.priceDelta > 0 && (
                            <span className="ml-1 opacity-50">
                              +{(opt.priceDelta / 1000).toLocaleString("id-ID")}rb
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.allowNotes && (
            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cocoa-800/50">
                Catatan
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={product.notesHint || "Contoh: tanpa daun bawang"}
                className={inputCls}
              />
            </div>
          )}

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cocoa-800/50">
              Jumlah
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="anim-btn-press flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-500 text-accent-500 transition hover:bg-accent-500 hover:text-white"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-8 text-center text-lg font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="anim-btn-press flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-500 text-accent-500 transition hover:bg-accent-500 hover:text-white"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl border-t border-cream-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-cocoa-800/50">Total</div>
              <div className="text-lg font-extrabold">{formatRupiah(unitPrice * qty)}</div>
            </div>
            <button
              onClick={() => onAdd(qty, selected, notes.trim(), variantText, unitPrice)}
              className="anim-btn-press rounded-2xl bg-accent-500 px-6 py-3 font-bold text-white transition hover:bg-accent-600"
            >
              Tambah ke Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
