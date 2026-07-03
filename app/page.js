"use client";

import { useMemo, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { useUI } from "@/context/UIContext";
import { formatRupiah } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import OrderPanel from "@/components/OrderPanel";
import PaymentModal from "@/components/PaymentModal";

export default function KasirPage() {
  const { showToast } = useUI();
  const categories = useProductStore((s) => s.categories);
  const products = useProductStore((s) => s.products);
  const consumeStock = useProductStore((s) => s.consumeStock);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);
  const search = useUIStore((s) => s.search);
  const setSearch = useUIStore((s) => s.setSearch);

  const [payTotals, setPayTotals] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.active === false) return false; // produk nonaktif tidak tampil di kasir
      const okCat = activeCategory === "all" || p.categoryId === activeCategory;
      const okQuery =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return okCat && okQuery;
    });
  }, [products, activeCategory, search]);

  const itemCount = items.reduce((s, it) => s + it.qty, 0);
  const cartTotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  function handleAdd(line) {
    addItem(line);
    showToast(`${line.name} masuk pesanan`);
  }

  function handleConfirmPayment(payment) {
    const record = useTransactionStore.getState().addTransaction({
      items: items.map(({ key, ...rest }) => rest),
      subtotal: payTotals.subtotal,
      discount: payTotals.discount,
      tax: payTotals.tax,
      total: payTotals.total,
      ...payment,
      status: "LUNAS",
    });
    consumeStock(items);
    return record;
  }

  function handleDone() {
    clearCart();
    setPayTotals(null);
    setCartOpen(false);
    showToast("Transaksi selesai ✨");
  }

  return (
    <div className="flex h-full">
      {/* Area produk */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Search + kategori (mobile) */}
        <div className="px-5 sm:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari produk..."
            className="w-full rounded-full border border-cream-200 bg-white px-4 py-2.5 text-sm shadow-card outline-none focus:border-accent-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 py-3 md:hidden">
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === "all"
                ? "bg-cocoa-800 text-white"
                : "bg-cream-50 text-cocoa-800/60"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                activeCategory === c.id
                  ? "bg-cocoa-800 text-white"
                  : "bg-cream-50 text-cocoa-800/60"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Grid produk */}
        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3 md:px-8 lg:pb-8">
          {filtered.length === 0 ? (
            <div className="mt-16 text-center text-cocoa-800/40">
              Tidak ada produk di kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="anim-fade-up"
                  style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                >
                  <ProductCard product={p} onAdd={handleAdd} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel pesanan desktop — kartu melayang seperti referensi */}
      <aside className="hidden w-[360px] shrink-0 p-4 pl-0 lg:block print:hidden">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-cream-200 bg-white shadow-card">
          <OrderPanel onPay={(totals) => setPayTotals(totals)} />
        </div>
      </aside>

      {/* Tombol keranjang mobile */}
      {itemCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 left-6 right-6 z-40 flex items-center justify-between rounded-2xl bg-cocoa-800 px-5 py-4 text-white shadow-panel lg:hidden print:hidden"
        >
          <span className="font-semibold">🛒 {itemCount} item</span>
          <span className="font-bold">{formatRupiah(cartTotal)}</span>
        </button>
      )}

      {/* Drawer pesanan mobile */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-cocoa-900/50 lg:hidden print:hidden">
          <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-t-3xl bg-white">
            <OrderPanel
              onPay={(totals) => setPayTotals(totals)}
              onClose={() => setCartOpen(false)}
            />
          </div>
        </div>
      )}

      {payTotals && (
        <PaymentModal
          totals={payTotals}
          onConfirm={handleConfirmPayment}
          onDone={handleDone}
          onClose={() => setPayTotals(null)}
        />
      )}
    </div>
  );
}
