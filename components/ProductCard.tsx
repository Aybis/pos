"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const out = product.trackStock && (product.stock || 0) <= 0;
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    if (out) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
    onAdd(product);
  }

  return (
    <div className="anim-card-hover flex h-full flex-col rounded-[1.5rem] bg-white p-4 shadow-card">
      <div className="relative">
        <div className="flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-cream-50 to-peach-100 text-6xl">
          {product.emoji || "🍽️"}
        </div>
        {out && (
          <span className="absolute left-2 top-2 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600">
            Habis
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="truncate font-bold">{product.name}</span>
        <span className="whitespace-nowrap font-bold">
          {formatRupiah(product.basePrice)}
        </span>
      </div>

      {product.trackStock && (
        <div
          className={`mt-1 text-[11px] ${
            product.stock <= 5 ? "font-semibold text-red-500" : "text-cocoa-800/40"
          }`}
        >
          Stok {product.stock}
        </div>
      )}

      <div className="mt-auto pt-3">
        <button
          onClick={handleClick}
          disabled={out}
          title="Tambah ke pesanan"
          className={`anim-btn-press flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-card transition ${
            justAdded ? "bg-green-500 anim-bounce-in" : "bg-accent-500 hover:bg-accent-600"
          } disabled:opacity-40`}
        >
          <FiPlus size={16} /> Tambah
        </button>
      </div>
    </div>
  );
}
