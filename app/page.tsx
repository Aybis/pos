"use client";

import { useMemo, useState, useCallback } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { useUI } from "@/context/UIContext";
import { formatRupiah } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import OrderPanel from "@/components/OrderPanel";
import PaymentModal from "@/components/PaymentModal";
import TransactionModal from "@/components/TransactionModal";
import AddToCartModal from "@/components/AddToCartModal";
import { Product, CartItem } from "@/types";

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

  const [payTotals, setPayTotals] = useState<{
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [addToCartProduct, setAddToCartProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.active === false) return false;
      const okCat = activeCategory === "all" || p.categoryId === activeCategory;
      const okQuery =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return okCat && okQuery;
    });
  }, [products, activeCategory, search]);

  const itemCount = items.reduce((s, it) => s + it.qty, 0);
  const cartTotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  const handleAddToCart = useCallback((product: Product) => {
    setAddToCartProduct(product);
  }, []);

  const handleAdd = useCallback((line: {
    productId: string;
    name: string;
    emoji: string;
    qty: number;
    unitPrice: number;
    selectedOptions: Record<string, string | string[]>;
    variantText: string;
    notes: string;
  }) => {
    addItem(line as CartItem);
    showToast(`${line.name} masuk pesanan`);
  }, [addItem, showToast]);

  function handleConfirmPayment(payment: {
    paymentMethod: string;
    paidAmount?: number;
    change?: number;
  }) {
    const record = useTransactionStore.getState().addTransaction({
      items: items.map(({ key, ...rest }) => rest),
      subtotal: payTotals?.subtotal || 0,
      discount: payTotals?.discount || 0,
      tax: payTotals?.tax || 0,
      total: payTotals?.total || 0,
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
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="px-5 sm:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-full border border-cream-200 bg-white px-4 py-2.5 text-sm shadow-card outline-none focus:border-accent-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 py-3 md:hidden">
          <button
            onClick={() => setActiveCategory("all")}
            className={`anim-btn-press whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === "all"
                ? "bg-cocoa-800 text-white"
                : "bg-cream-50 text-cocoa-800/60"
            }`}
          >
            Semua
          </button>
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`anim-btn-press whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                activeCategory === c.id
                  ? "bg-cocoa-800 text-white"
                  : "bg-cream-50 text-cocoa-800/60"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3 md:px-8 lg:pb-8">
          {filtered.length === 0 ? (
            <div className="mt-16 text-center text-cocoa-800/40">
              Tidak ada produk di kategori ini.
            </div>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="anim-fade-up h-full"
                  style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                >
                  <ProductCard product={p} onAdd={handleAddToCart} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="hidden w-[360px] shrink-0 p-4 pl-0 lg:block print:hidden">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-cream-200 bg-white shadow-card">
          <OrderPanel onPay={(totals) => setPayTotals(totals)} />
        </div>
      </aside>

      {itemCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="anim-btn-hover fixed bottom-24 left-6 right-6 z-40 flex items-center justify-between rounded-2xl bg-cocoa-800 px-5 py-4 text-white shadow-panel lg:hidden print:hidden"
        >
          <span className="flex items-center gap-2 font-semibold">
            <FiShoppingCart size={17} /> {itemCount} item
          </span>
          <span className="font-bold">{formatRupiah(cartTotal)}</span>
        </button>
      )}

      {cartOpen && (
        <TransactionModal
          onPay={(totals) => setPayTotals(totals)}
          onClose={() => setCartOpen(false)}
        />
      )}

      {payTotals && (
        <PaymentModal
          totals={payTotals}
          onConfirm={handleConfirmPayment}
          onDone={handleDone}
          onClose={() => setPayTotals(null)}
        />
      )}

      {addToCartProduct && (
        <AddToCartModal
          product={addToCartProduct}
          onAdd={(qty, selectedOptions, notes, variantText, unitPrice) => {
            handleAdd({
              productId: addToCartProduct.id,
              name: addToCartProduct.name,
              emoji: addToCartProduct.emoji,
              qty,
              unitPrice,
              selectedOptions,
              variantText,
              notes,
            });
            setAddToCartProduct(null);
          }}
          onClose={() => setAddToCartProduct(null)}
        />
      )}
    </div>
  );
}
