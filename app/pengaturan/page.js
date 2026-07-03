"use client";

import { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProductStore } from "@/store/useProductStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUI } from "@/context/UIContext";

const BACKUP_KEYS = ["pos-products", "pos-transactions", "pos-settings"];

export default function PengaturanPage() {
  const { hydrated, showToast } = useUI();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetToSeed = useProductStore((s) => s.resetToSeed);
  const clearTransactions = useTransactionStore((s) => s.clearAll);
  const fileRef = useRef(null);

  const [form, setForm] = useState(settings);
  useEffect(() => {
    if (hydrated) setForm(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return null;

  const inputCls =
    "w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-400";

  function save() {
    updateSettings({ ...form, taxPercent: Number(form.taxPercent) || 0 });
    showToast("Pengaturan disimpan");
  }

  // ---- Backup & Restore (ala ekspor data Odoo, versi sederhana) ----
  function exportBackup() {
    const data = { exportedAt: new Date().toISOString(), version: 1 };
    for (const key of BACKUP_KEYS) {
      data[key] = JSON.parse(localStorage.getItem(key) || "null");
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-pos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Backup terunduh 💾");
  }

  function importBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const hasData = BACKUP_KEYS.some((k) => data[k]);
        if (!hasData) throw new Error("bukan file backup");
        if (
          !confirm(
            "Pulihkan data dari backup? Data saat ini akan DITIMPA seluruhnya."
          )
        )
          return;
        for (const key of BACKUP_KEYS) {
          if (data[key]) localStorage.setItem(key, JSON.stringify(data[key]));
        }
        location.reload();
      } catch {
        showToast("File backup tidak valid", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-4 pb-10">
        <p className="anim-fade-up text-sm text-cocoa-800/50">
          Identitas ini tampil di struk — ubah agar sesuai usaha kamu (kafe,
          warung, toko apa pun).
        </p>

        {/* Identitas toko */}
        <div
          className="anim-fade-up mt-4 space-y-4 rounded-2xl bg-white p-6 shadow-card"
          style={{ animationDelay: "60ms" }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Nama Usaha
            </label>
            <input
              value={form.storeName}
              onChange={(e) =>
                setForm((f) => ({ ...f, storeName: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Alamat</label>
            <input
              value={form.storeAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, storeAddress: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                No. Telepon
              </label>
              <input
                value={form.storePhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, storePhone: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Pajak (%)
              </label>
              <input
                type="number"
                min="0"
                value={form.taxPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, taxPercent: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Catatan Kaki Struk
            </label>
            <input
              value={form.receiptFooter}
              onChange={(e) =>
                setForm((f) => ({ ...f, receiptFooter: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <button
            onClick={save}
            className="w-full rounded-xl bg-cocoa-800 py-3 font-semibold text-white transition hover:bg-cocoa-700"
          >
            Simpan Pengaturan
          </button>
        </div>

        {/* Backup & Restore */}
        <div
          className="anim-fade-up mt-5 rounded-2xl bg-white p-6 shadow-card"
          style={{ animationDelay: "120ms" }}
        >
          <div className="font-bold">💾 Backup & Pulihkan Data</div>
          <p className="mt-1 text-sm text-cocoa-800/50">
            Data tersimpan di browser perangkat ini. Unduh backup secara rutin
            agar aman, dan gunakan file yang sama untuk pindah perangkat.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={exportBackup}
              className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-accent-600"
            >
              ⬇️ Unduh Backup
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-cream-300 px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-cream-50"
            >
              ⬆️ Pulihkan dari File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={importBackup}
              className="hidden"
            />
          </div>
        </div>

        {/* Zona berbahaya */}
        <div
          className="anim-fade-up mt-5 rounded-2xl border border-red-200 bg-red-50 p-6"
          style={{ animationDelay: "180ms" }}
        >
          <div className="font-bold text-red-600">Zona Berbahaya</div>
          <p className="mt-1 text-sm text-red-500/80">
            Aksi di bawah tidak bisa dibatalkan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (confirm("Kembalikan produk & kategori ke data contoh?")) {
                  resetToSeed();
                  showToast("Produk direset ke data contoh");
                }
              }}
              className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Reset Produk ke Contoh
            </button>
            <button
              onClick={() => {
                if (confirm("Hapus SEMUA riwayat transaksi?")) {
                  clearTransactions();
                  showToast("Riwayat transaksi dihapus");
                }
              }}
              className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Hapus Riwayat Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
