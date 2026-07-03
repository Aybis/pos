"use client";

import { useState } from "react";
import { uid } from "@/lib/format";
import { Category, Product, VariantGroup } from "@/types";

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}

type FormProduct = Partial<Product> & {
  name: string;
  categoryId: string;
  basePrice: number | string;
  emoji: string;
  trackStock: boolean;
  stock: number | string;
  allowNotes: boolean;
  notesHint?: string;
  variantGroups: VariantGroup[];
};

export default function ProductFormModal({ product, categories, onSave, onClose }: ProductFormModalProps) {
  const [form, setForm] = useState<FormProduct>(
    product || {
      name: "",
      categoryId: categories[0]?.id || "",
      basePrice: 0,
      emoji: "🍽️",
      trackStock: false,
      stock: 0,
      allowNotes: true,
      notesHint: "",
      variantGroups: [],
    }
  );

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addGroup() {
    set("variantGroups", [
      ...form.variantGroups,
      {
        id: uid("vg-"),
        name: "",
        type: "single",
        required: true,
        options: [{ id: uid("vo-"), name: "", priceDelta: 0 }],
      },
    ]);
  }
  function updateGroup(gid: string, data: Partial<VariantGroup>) {
    set(
      "variantGroups",
      form.variantGroups.map((g) => (g.id === gid ? { ...g, ...data } : g))
    );
  }
  function removeGroup(gid: string) {
    set("variantGroups", form.variantGroups.filter((g) => g.id !== gid));
  }
  function addOption(gid: string) {
    updateGroup(gid, {
      options: [
        ...form.variantGroups.find((g) => g.id === gid)!.options,
        { id: uid("vo-"), name: "", priceDelta: 0 },
      ],
    });
  }
  function updateOption(gid: string, oid: string, data: Partial<{ name: string; priceDelta: number }>) {
    const g = form.variantGroups.find((x) => x.id === gid)!;
    updateGroup(gid, {
      options: g.options.map((o) => (o.id === oid ? { ...o, ...data } : o)),
    });
  }
  function removeOption(gid: string, oid: string) {
    const g = form.variantGroups.find((x) => x.id === gid)!;
    updateGroup(gid, { options: g.options.filter((o) => o.id !== oid) });
  }

  function submit() {
    if (!form.name.trim() || !form.categoryId) return;
    const cleaned: Partial<Product> = {
      ...form,
      basePrice: Number(form.basePrice) || 0,
      stock: Number(form.stock) || 0,
      variantGroups: form.variantGroups
        .filter((g) => g.name.trim())
        .map((g) => ({
          ...g,
          options: g.options
            .filter((o) => o.name.trim())
            .map((o) => ({ ...o, priceDelta: Number(o.priceDelta) || 0 })),
        }))
        .filter((g) => g.options.length > 0),
    };
    onSave(cleaned);
  }

  const inputCls =
    "w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-400";

  return (
    <div
      className="anim-fade-in fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="anim-scale-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-panel sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {product ? "Edit Produk" : "Tambah Produk"}
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100">
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              Nama Produk
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Soto Ayam"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Kategori
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Harga Dasar (Rp)
            </label>
            <input
              type="number"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Ikon / Emoji
            </label>
            <input
              value={form.emoji}
              onChange={(e) => set("emoji", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.trackStock}
                onChange={(e) => set("trackStock", e.target.checked)}
                className="h-4 w-4 accent-accent-500"
              />
              Lacak Stok
            </label>
            {form.trackStock && (
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                placeholder="Jumlah stok"
                className={inputCls + " flex-1"}
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.allowNotes}
                onChange={(e) => set("allowNotes", e.target.checked)}
                className="h-4 w-4 accent-accent-500"
              />
              Izinkan catatan pesanan (mis. &quot;tanpa daun bawang&quot;)
            </label>
            {form.allowNotes && (
              <input
                value={form.notesHint || ""}
                onChange={(e) => set("notesHint", e.target.value)}
                placeholder="Placeholder catatan, contoh: tanpa jeruk nipis"
                className={inputCls + " mt-2"}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Grup Varian</div>
            <button
              onClick={addGroup}
              className="rounded-lg bg-cream-100 px-3 py-1.5 text-sm font-medium hover:bg-cream-200"
            >
              + Tambah Grup
            </button>
          </div>
          <p className="mt-1 text-xs text-cocoa-800/50">
            Contoh grup: &quot;Nasi&quot; (pakai/tanpa), &quot;Rasa&quot;
            (pedas/original), &quot;Berat&quot; (1kg, 1/2kg, 1/4kg). Selisih
            harga diisi relatif terhadap harga dasar.
          </p>

          {form.variantGroups.map((g) => (
            <div key={g.id} className="mt-3 rounded-2xl bg-cream-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={g.name}
                  onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                  placeholder="Nama grup (mis. Berat)"
                  className={inputCls + " flex-1 min-w-[140px]"}
                />
                <select
                  value={g.type}
                  onChange={(e) => updateGroup(g.id, { type: e.target.value as "single" | "multi" })}
                  className={inputCls + " w-auto"}
                >
                  <option value="single">Pilih satu</option>
                  <option value="multi">Boleh banyak</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={g.required}
                    onChange={(e) =>
                      updateGroup(g.id, { required: e.target.checked })
                    }
                    className="h-4 w-4 accent-accent-500"
                  />
                  Wajib
                </label>
                <button
                  onClick={() => removeGroup(g.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {g.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <input
                      value={o.name}
                      onChange={(e) =>
                        updateOption(g.id, o.id, { name: e.target.value })
                      }
                      placeholder="Nama opsi (mis. 1 kg)"
                      className={inputCls + " flex-1"}
                    />
                    <input
                      type="number"
                      value={o.priceDelta}
                        onChange={(e) =>
                          updateOption(g.id, o.id, { priceDelta: Number(e.target.value) })
                        }
                      placeholder="+Harga"
                      className={inputCls + " w-28"}
                    />
                    <button
                      onClick={() => removeOption(g.id, o.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(g.id)}
                  className="text-sm font-medium text-accent-600 hover:underline"
                >
                  + Tambah opsi
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!form.name.trim()}
          className="mt-6 w-full rounded-xl bg-cocoa-800 py-3.5 font-semibold text-white hover:bg-cocoa-700 disabled:opacity-40"
        >
          Simpan Produk
        </button>
      </div>
    </div>
  );
}