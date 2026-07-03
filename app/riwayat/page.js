"use client";

import { useMemo, useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUI } from "@/context/UIContext";
import { formatRupiah, formatDateTime } from "@/lib/format";
import Receipt from "@/components/Receipt";

const RANGES = [
  { id: "all", label: "Semua" },
  { id: "today", label: "Hari Ini" },
  { id: "7d", label: "7 Hari" },
  { id: "30d", label: "30 Hari" },
];

export default function RiwayatPage() {
  const { hydrated, showToast } = useUI();
  const transactions = useTransactionStore((s) => s.transactions);
  const refundTransaction = useTransactionStore((s) => s.refundTransaction);
  const restoreStock = useProductStore((s) => s.restoreStock);
  const user = useAuthStore((s) => s.user);

  const [detail, setDetail] = useState(null);
  const [range, setRange] = useState("all");
  const [method, setMethod] = useState("all");
  const [query, setQuery] = useState("");

  const methods = useMemo(
    () => [...new Set(transactions.map((t) => t.paymentMethod))],
    [transactions]
  );

  const filtered = useMemo(() => {
    let out = transactions;
    if (range !== "all") {
      const now = new Date();
      const start = new Date(now);
      if (range === "today") start.setHours(0, 0, 0, 0);
      if (range === "7d") start.setDate(now.getDate() - 7);
      if (range === "30d") start.setDate(now.getDate() - 30);
      out = out.filter((t) => new Date(t.createdAt) >= start);
    }
    if (method !== "all") out = out.filter((t) => t.paymentMethod === method);
    if (query)
      out = out.filter((t) =>
        t.id.toLowerCase().includes(query.toLowerCase())
      );
    return out;
  }, [transactions, range, method, query]);

  const summary = useMemo(() => {
    const valid = filtered.filter((t) => t.status !== "REFUND");
    return {
      count: filtered.length,
      total: valid.reduce((s, t) => s + t.total, 0),
      refunds: filtered.length - valid.length,
    };
  }, [filtered]);

  if (!hydrated) return null;

  function handleRefund(trx) {
    if (
      !confirm(
        `Refund ${trx.id} senilai ${formatRupiah(trx.total)}?\nStok item akan dikembalikan.`
      )
    )
      return;
    refundTransaction(trx.id);
    restoreStock(trx.items);
    setDetail(null);
    showToast(`${trx.id} berhasil di-refund`);
  }

  const inputCls =
    "rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-400";

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-4 pb-10">
        {/* Toolbar filter */}
        <div className="anim-fade-up flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  range === r.id
                    ? "bg-cocoa-800 text-white"
                    : "bg-white shadow-card hover:-translate-y-0.5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={inputCls}
          >
            <option value="all">Semua Metode</option>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Cari No. TRX..."
            className={inputCls + " w-40"}
          />
        </div>

        {/* Ringkasan filter */}
        <div
          className="anim-fade-up mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl bg-white px-5 py-3.5 text-sm shadow-card"
          style={{ animationDelay: "80ms" }}
        >
          <span>
            <span className="font-extrabold">{summary.count}</span>{" "}
            <span className="text-cocoa-800/50">transaksi</span>
          </span>
          <span>
            <span className="font-extrabold">{formatRupiah(summary.total)}</span>{" "}
            <span className="text-cocoa-800/50">pendapatan</span>
          </span>
          {summary.refunds > 0 && (
            <span className="text-red-500">
              <span className="font-extrabold">{summary.refunds}</span> refund
            </span>
          )}
        </div>

        {/* Daftar */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="anim-fade-up rounded-2xl bg-white p-10 text-center text-cocoa-800/40 shadow-card">
              Tidak ada transaksi yang cocok dengan filter.
            </div>
          )}
          {filtered.map((t, i) => {
            const refunded = t.status === "REFUND";
            return (
              <button
                key={t.id}
                onClick={() => setDetail(t)}
                style={{ animationDelay: `${Math.min(i * 35, 350)}ms` }}
                className="anim-fade-up flex w-full flex-wrap items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-panel"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    refunded ? "bg-red-50" : "bg-gradient-to-br from-cream-50 to-peach-100"
                  }`}
                >
                  {refunded ? "↩️" : "🧾"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{t.id}</div>
                  <div className="text-xs text-cocoa-800/50">
                    {formatDateTime(t.createdAt)} ·{" "}
                    {t.items.reduce((s, it) => s + it.qty, 0)} item
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    refunded
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {refunded ? "REFUND" : t.paymentMethod}
                </span>
                <span
                  className={`font-extrabold ${
                    refunded ? "text-cocoa-800/30 line-through" : ""
                  }`}
                >
                  {formatRupiah(t.total)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail modal */}
        {detail && (
          <div
            className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-cocoa-900/50 p-4 print:bg-transparent"
            onClick={() => setDetail(null)}
          >
            <div
              className="anim-scale-in max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-panel print:shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              {detail.status === "REFUND" && (
                <div className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-bold text-red-600 print:hidden">
                  ↩️ Transaksi ini sudah di-refund
                  {detail.refundedAt &&
                    ` · ${formatDateTime(detail.refundedAt)}`}
                </div>
              )}
              <div className="rounded-2xl border border-cream-200">
                <Receipt trx={detail} />
              </div>
              <div className="mt-4 flex gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl border border-cocoa-800 py-3 text-sm font-semibold hover:bg-cream-50"
                >
                  🖨️ Cetak
                </button>
                {user?.role === "admin" && detail.status !== "REFUND" && (
                  <button
                    onClick={() => handleRefund(detail)}
                    className="flex-1 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    ↩️ Refund
                  </button>
                )}
                <button
                  onClick={() => setDetail(null)}
                  className="flex-1 rounded-xl bg-cocoa-800 py-3 text-sm font-semibold text-white hover:bg-cocoa-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
