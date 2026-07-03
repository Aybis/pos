"use client";

import { useMemo, useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useUI } from "@/context/UIContext";
import { formatRupiah } from "@/lib/format";
import ProductFormModal from "@/components/ProductFormModal";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "low", label: "⚠️ Stok Menipis" },
  { id: "inactive", label: "Nonaktif" },
];

const SORTS = [
  { id: "name", label: "Nama A-Z" },
  { id: "price", label: "Harga Tertinggi" },
  { id: "stock", label: "Stok Terendah" },
];

export default function ProdukPage() {
  const { hydrated, showToast } = useUI();
  const categories = useProductStore((s) => s.categories);
  const products = useProductStore((s) => s.products);
  const addCategory = useProductStore((s) => s.addCategory);
  const updateCategory = useProductStore((s) => s.updateCategory);
  const deleteCategory = useProductStore((s) => s.deleteCategory);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const duplicateProduct = useProductStore((s) => s.duplicateProduct);
  const toggleActive = useProductStore((s) => s.toggleActive);
  const adjustStock = useProductStore((s) => s.adjustStock);

  const [modal, setModal] = useState(null); // null | "new" | product
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [showCategories, setShowCategories] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "" });

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (catFilter !== "all" && p.categoryId !== catFilter) return false;
      if (filter === "low" && !(p.trackStock && (p.stock || 0) <= 5))
        return false;
      if (filter === "inactive" && p.active !== false) return false;
      if (filter === "all" && p.active === false) return false;
      return true;
    });
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price") out.sort((a, b) => b.basePrice - a.basePrice);
    if (sort === "stock")
      out.sort(
        (a, b) =>
          (a.trackStock ? a.stock : Infinity) -
          (b.trackStock ? b.stock : Infinity)
      );
    return out;
  }, [products, query, catFilter, filter, sort]);

  const stat = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.active !== false).length,
      low: products.filter((p) => p.trackStock && (p.stock || 0) <= 5).length,
      cats: categories.length,
    }),
    [products, categories]
  );

  if (!hydrated) return null;

  function saveProduct(data) {
    if (modal === "new") {
      addProduct(data);
      showToast("Produk ditambahkan ✨");
    } else {
      updateProduct(modal.id, data);
      showToast("Produk diperbarui");
    }
    setModal(null);
  }

  function handleAddCategory() {
    if (!newCat.name.trim()) return;
    addCategory({ name: newCat.name.trim(), icon: newCat.icon || "🏷️" });
    setNewCat({ name: "", icon: "" });
    showToast("Kategori ditambahkan");
  }

  const inputCls =
    "rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-400";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-4 pb-10">
        {/* Statistik mini */}
        <div className="anim-fade-up grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Produk", value: stat.total },
            { label: "Aktif", value: stat.active },
            {
              label: "Stok Menipis",
              value: stat.low,
              alert: stat.low > 0,
            },
            { label: "Kategori", value: stat.cats },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{ animationDelay: `${i * 50}ms` }}
              className="anim-fade-up rounded-2xl bg-white p-4 shadow-card"
            >
              <div className="text-xs text-cocoa-800/45">{s.label}</div>
              <div
                className={`mt-0.5 text-2xl font-extrabold ${
                  s.alert ? "text-red-500" : ""
                }`}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div
          className="anim-fade-up mt-5 flex flex-wrap items-center gap-2"
          style={{ animationDelay: "150ms" }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Cari produk..."
            className={inputCls + " w-full sm:w-56"}
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className={inputCls}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={inputCls}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                Urut: {s.label}
              </option>
            ))}
          </select>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  filter === f.id
                    ? "bg-cocoa-800 text-white"
                    : "bg-white shadow-card hover:-translate-y-0.5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowCategories((v) => !v)}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-card transition hover:-translate-y-0.5"
            >
              🏷️ Kategori
            </button>
            <button
              onClick={() => setModal("new")}
              className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-accent-600"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Panel kategori (collapsible) */}
        {showCategories && (
          <section className="anim-scale-in mt-4 rounded-2xl bg-white p-5 shadow-card">
            <div className="text-sm font-bold">Kelola Kategori</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="group flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-sm"
                >
                  <button
                    onClick={() => {
                      const name = prompt("Ubah nama kategori:", c.name);
                      if (name?.trim())
                        updateCategory(c.id, { name: name.trim() });
                    }}
                    title="Klik untuk ubah nama"
                  >
                    {c.icon} {c.name}
                  </button>
                  <span className="text-xs text-cocoa-800/40">
                    ({products.filter((p) => p.categoryId === c.id).length})
                  </span>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Hapus kategori "${c.name}" beserta semua produknya?`
                        )
                      ) {
                        deleteCategory(c.id);
                        showToast("Kategori dihapus");
                      }
                    }}
                    className="text-red-400 opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={newCat.icon}
                onChange={(e) =>
                  setNewCat((s) => ({ ...s, icon: e.target.value }))
                }
                placeholder="🏷️"
                className={inputCls + " w-16 text-center"}
              />
              <input
                value={newCat.name}
                onChange={(e) =>
                  setNewCat((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Nama kategori baru (mis. Dessert)"
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className={inputCls + " min-w-[180px] flex-1"}
              />
              <button
                onClick={handleAddCategory}
                className="rounded-xl bg-cream-100 px-4 py-2 text-sm font-semibold hover:bg-cream-200"
              >
                Tambah
              </button>
            </div>
          </section>
        )}

        {/* Daftar produk */}
        <section className="mt-4 space-y-3">
          {list.length === 0 && (
            <div className="anim-fade-up rounded-2xl bg-white p-10 text-center shadow-card">
              <div className="text-4xl">🔎</div>
              <div className="mt-2 font-semibold">Tidak ada produk</div>
              <div className="mt-1 text-sm text-cocoa-800/50">
                Coba ubah filter, atau tambahkan produk baru.
              </div>
            </div>
          )}
          {list.map((p, i) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            const inactive = p.active === false;
            return (
              <div
                key={p.id}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                className={`anim-fade-up flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition hover:shadow-panel ${
                  inactive ? "opacity-60" : ""
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cream-50 to-peach-100 text-2xl">
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="truncate">{p.name}</span>
                    {inactive && (
                      <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-bold text-cocoa-800/50">
                        NONAKTIF
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-cocoa-800/50">
                    <span>{cat ? `${cat.icon} ${cat.name}` : "—"}</span>
                    <span>·</span>
                    <span className="font-semibold text-cocoa-800">
                      {formatRupiah(p.basePrice)}
                    </span>
                    {p.variantGroups?.length > 0 && (
                      <>
                        <span>·</span>
                        {p.variantGroups.map((g) => (
                          <span
                            key={g.id}
                            className="rounded-full bg-cream-100 px-2 py-0.5"
                          >
                            {g.name} ({g.options.length})
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {p.trackStock && (
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-cocoa-800/50">Stok</span>
                    <input
                      type="number"
                      value={p.stock}
                      onChange={(e) => adjustStock(p.id, e.target.value)}
                      className={`w-20 rounded-lg border px-2 py-1.5 text-center outline-none transition focus:border-accent-400 ${
                        p.stock <= 5
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-cream-200"
                      }`}
                    />
                  </label>
                )}

                {/* Toggle aktif */}
                <button
                  onClick={() => {
                    toggleActive(p.id);
                    showToast(
                      inactive ? `${p.name} diaktifkan` : `${p.name} dinonaktifkan`
                    );
                  }}
                  title={inactive ? "Aktifkan di kasir" : "Sembunyikan dari kasir"}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
                    inactive ? "bg-cream-200" : "bg-accent-500"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      inactive ? "translate-x-0.5" : "translate-x-[22px]"
                    }`}
                  />
                </button>

                <div className="flex gap-1.5">
                  <IconBtn
                    title="Duplikat"
                    onClick={() => {
                      duplicateProduct(p.id);
                      showToast("Produk diduplikat");
                    }}
                  >
                    📋
                  </IconBtn>
                  <IconBtn title="Edit" onClick={() => setModal(p)}>
                    ✏️
                  </IconBtn>
                  <IconBtn
                    title="Hapus"
                    danger
                    onClick={() => {
                      if (confirm(`Hapus produk "${p.name}" secara permanen?`)) {
                        deleteProduct(p.id);
                        showToast("Produk dihapus");
                      }
                    }}
                  >
                    🗑️
                  </IconBtn>
                </div>
              </div>
            );
          })}
        </section>

        {modal && (
          <ProductFormModal
            product={modal === "new" ? null : modal}
            categories={categories}
            onSave={saveProduct}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, title, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm transition hover:-translate-y-0.5 ${
        danger
          ? "bg-red-50 hover:bg-red-100"
          : "bg-cream-100 hover:bg-cream-200"
      }`}
    >
      {children}
    </button>
  );
}
