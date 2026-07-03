"use client";

import { useMemo, useState } from "react";
import { FiShoppingCart, FiPlus } from "react-icons/fi";
import { calcUnitPrice, variantLabel, formatRupiah } from "@/lib/format";

// Kartu produk gaya referensi: area gambar + tombol keranjang oranye,
// baris "Tambah catatan +", dan chip varian langsung di kartu.
export default function ProductCard({ product, onAdd }) {
  const out = product.trackStock && (product.stock || 0) <= 0;

  const [selected, setSelected] = useState(() => {
    const init = {};
    for (const g of product.variantGroups || []) {
      if (g.options.length === 0) continue;
      if (g.type === "single") init[g.id] = g.options[0].id;
      // Grup multi wajib: mulai dengan opsi pertama terpilih
      else if (g.required) init[g.id] = [g.options[0].id];
    }
    return init;
  });
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const unitPrice = useMemo(
    () => calcUnitPrice(product, selected),
    [product, selected]
  );

  function toggle(group, optId) {
    setSelected((prev) => {
      if (group.type === "single") return { ...prev, [group.id]: optId };
      const cur = Array.isArray(prev[group.id]) ? prev[group.id] : [];
      const next = cur.includes(optId)
        ? cur.filter((x) => x !== optId)
        : [...cur, optId];
      // Grup wajib tidak boleh kosong
      if (group.required && next.length === 0) return prev;
      return { ...prev, [group.id]: next };
    });
  }

  function add() {
    if (out) return;
    onAdd({
      productId: product.id,
      name: product.name,
      emoji: product.emoji,
      qty: 1,
      unitPrice,
      selectedOptions: selected,
      variantText: variantLabel(product, selected),
      notes: notes.trim(),
    });
    setNotes("");
    setNotesOpen(false);
  }

  return (
    <div
      className={`flex h-full flex-col rounded-[1.5rem] bg-white p-4 shadow-card transition hover:shadow-panel ${
        out ? "opacity-50" : ""
      }`}
    >
      {/* Area gambar + tombol keranjang */}
      <div className="relative">
        <div className="flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-cream-50 to-peach-100 text-6xl">
          {product.emoji || "🍽️"}
        </div>
        <button
          onClick={add}
          disabled={out}
          title="Tambah ke pesanan"
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white shadow-card transition hover:scale-110 disabled:hover:scale-100"
        >
          <FiShoppingCart size={18} />
        </button>
        {out && (
          <span className="absolute left-2 top-2 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600">
            Habis
          </span>
        )}
      </div>

      {/* Nama + harga */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="truncate font-bold">{product.name}</span>
        <span className="whitespace-nowrap font-bold">
          {formatRupiah(unitPrice)}
        </span>
      </div>

      {/* Stok */}
      {product.trackStock && (
        <div
          className={`mt-1 text-[11px] ${
            product.stock <= 5 ? "font-semibold text-red-500" : "text-cocoa-800/40"
          }`}
        >
          Stok {product.stock}
        </div>
      )}

      {/* Tambah catatan */}
      {product.allowNotes && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-cocoa-800/50">Tambah catatan</span>
            <button
              onClick={() => setNotesOpen((v) => !v)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                notesOpen || notes
                  ? "border-accent-500 bg-accent-500 text-white"
                  : "border-cream-300 text-cocoa-800/50 hover:border-accent-400"
              }`}
            >
              <FiPlus size={14} />
            </button>
          </div>
          {notesOpen && (
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={product.notesHint || "Contoh: tanpa daun bawang"}
              autoFocus
              className="mt-2 w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-xs outline-none focus:border-accent-400"
            />
          )}
        </div>
      )}

      {/* Chip varian */}
      {(product.variantGroups || []).map((group) => (
        <div key={group.id} className="mt-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-cocoa-800/35">
            {group.name}
          </div>
          <div className="flex flex-wrap gap-1.5">
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
                  className={`rounded-xl px-3 py-2 text-xs transition ${
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
  );
}
