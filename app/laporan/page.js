"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useProductStore } from "@/store/useProductStore";
import { useUI } from "@/context/UIContext";
import { formatRupiah, formatDateTime } from "@/lib/format";

const RANGES = [
  { id: "today", label: "Hari Ini", days: 1 },
  { id: "7d", label: "7 Hari", days: 7 },
  { id: "30d", label: "30 Hari", days: 30 },
  { id: "all", label: "Semua", days: null },
];

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inWindow(t, from, to) {
  const d = new Date(t.createdAt);
  return d >= from && d < to;
}

// Transaksi sah = bukan refund
function isValid(t) {
  return t.status !== "REFUND";
}

export default function DashboardPage() {
  const { hydrated, showToast } = useUI();
  const transactions = useTransactionStore((s) => s.transactions);
  const products = useProductStore((s) => s.products);
  const [range, setRange] = useState("today");

  const now = new Date();

  // Jendela periode terpilih + periode pembanding sebelumnya
  const { current, previous } = useMemo(() => {
    const def = RANGES.find((r) => r.id === range);
    const valid = transactions.filter(isValid);
    if (!def.days) return { current: valid, previous: null };
    const to = new Date(now.getTime() + 1);
    const from = startOfDay(new Date(now.getTime() - (def.days - 1) * 86400000));
    const prevTo = from;
    const prevFrom = new Date(from.getTime() - def.days * 86400000);
    return {
      current: valid.filter((t) => inWindow(t, from, to)),
      previous: valid.filter((t) => inWindow(t, prevFrom, prevTo)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, range]);

  const stats = useMemo(() => {
    const sum = (list) => list.reduce((s, t) => s + t.total, 0);
    const revenue = sum(current);
    const count = current.length;
    const itemsSold = current.reduce(
      (s, t) => s + t.items.reduce((x, it) => x + it.qty, 0),
      0
    );
    const avg = count ? Math.round(revenue / count) : 0;

    const delta = (cur, prev) => {
      if (previous === null || prev === 0) return null;
      return Math.round(((cur - prev) / prev) * 100);
    };
    const prevRevenue = previous ? sum(previous) : 0;
    const prevCount = previous ? previous.length : 0;

    // Bar chart: pendapatan 7 hari terakhir
    const week = [...Array(7)].map((_, i) => {
      const day = startOfDay(new Date(now.getTime() - (6 - i) * 86400000));
      const next = new Date(day.getTime() + 86400000);
      const total = transactions
        .filter(isValid)
        .filter((t) => inWindow(t, day, next))
        .reduce((s, t) => s + t.total, 0);
      return { label: DAY_LABELS[day.getDay()], total, isToday: i === 6 };
    });
    const weekMax = Math.max(...week.map((d) => d.total), 1);

    // Produk terlaris (periode terpilih)
    const byProduct = {};
    for (const t of current) {
      for (const it of t.items) {
        byProduct[it.name] = byProduct[it.name] || { qty: 0, revenue: 0 };
        byProduct[it.name].qty += it.qty;
        byProduct[it.name].revenue += it.qty * it.unitPrice;
      }
    }
    const top = Object.entries(byProduct)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5);

    // Metode pembayaran
    const byMethod = {};
    for (const t of current) {
      byMethod[t.paymentMethod] = (byMethod[t.paymentMethod] || 0) + t.total;
    }

    return {
      revenue,
      count,
      itemsSold,
      avg,
      deltaRevenue: delta(revenue, prevRevenue),
      deltaCount: delta(count, prevCount),
      week,
      weekMax,
      top,
      byMethod,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, previous, transactions]);

  const lowStock = products.filter(
    (p) => p.active !== false && p.trackStock && (p.stock || 0) <= 5
  );
  const recent = transactions.slice(0, 5);

  if (!hydrated) return null;

  function exportCSV() {
    const rows = [
      ["ID", "Tanggal", "Item", "Subtotal", "Diskon", "Pajak", "Total", "Metode", "Status"],
      ...current.map((t) => [
        t.id,
        new Date(t.createdAt).toLocaleString("id-ID"),
        t.items
          .map(
            (it) =>
              `${it.qty}x ${it.name}${it.variantText ? ` (${it.variantText})` : ""}`
          )
          .join(" | "),
        t.subtotal,
        t.discount,
        t.tax,
        t.total,
        t.paymentMethod,
        t.status || "LUNAS",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `laporan-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Laporan CSV terunduh");
  }

  const KPIS = [
    {
      label: "Pendapatan",
      value: formatRupiah(stats.revenue),
      delta: stats.deltaRevenue,
      dark: true,
    },
    { label: "Transaksi", value: stats.count, delta: stats.deltaCount },
    { label: "Item Terjual", value: stats.itemsSold },
    { label: "Rata-rata / Transaksi", value: formatRupiah(stats.avg) },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-4 pb-10">
        {/* Toolbar */}
        <div className="anim-fade-up flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  range === r.id
                    ? "bg-cocoa-800 text-white shadow-card"
                    : "bg-white shadow-card hover:-translate-y-0.5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCSV}
            disabled={current.length === 0}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-card transition hover:-translate-y-0.5 disabled:opacity-40"
          >
            ⬇️ Ekspor CSV
          </button>
        </div>

        {/* KPI */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k, i) => (
            <div
              key={k.label}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`anim-fade-up rounded-2xl p-5 shadow-card transition hover:-translate-y-1 hover:shadow-panel ${
                k.dark ? "bg-cocoa-800 text-white" : "bg-white"
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  k.dark ? "text-white/50" : "text-cocoa-800/45"
                }`}
              >
                {k.label}
              </div>
              <div className="mt-1 truncate text-xl font-extrabold lg:text-2xl">
                {k.value}
              </div>
              {k.delta !== null && k.delta !== undefined && (
                <div
                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    k.delta >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta)}%
                  <span className="font-normal opacity-60">vs sebelumnya</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Grafik 7 hari */}
          <section
            className="anim-fade-up rounded-2xl bg-white p-5 shadow-card lg:col-span-3"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-baseline justify-between">
              <div className="font-bold">Penjualan 7 Hari Terakhir</div>
              <div className="text-xs text-cocoa-800/40">per hari</div>
            </div>
            <div className="mt-4 flex h-44 items-end gap-3">
              {stats.week.map((d, i) => (
                <div
                  key={i}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="text-[10px] font-bold text-cocoa-800/60 opacity-0 transition group-hover:opacity-100">
                    {d.total > 0 ? formatRupiah(d.total).replace("Rp ", "") : "-"}
                  </div>
                  <div
                    title={formatRupiah(d.total)}
                    style={{
                      height: `${Math.max((d.total / stats.weekMax) * 100, 3)}%`,
                      animationDelay: `${200 + i * 70}ms`,
                    }}
                    className={`anim-grow-up w-full max-w-[44px] rounded-t-xl transition-colors ${
                      d.isToday
                        ? "bg-accent-500"
                        : "bg-peach-100 group-hover:bg-accent-400/40"
                    }`}
                  />
                  <div
                    className={`text-xs ${
                      d.isToday
                        ? "font-bold text-accent-600"
                        : "text-cocoa-800/40"
                    }`}
                  >
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Metode pembayaran */}
          <section
            className="anim-fade-up rounded-2xl bg-white p-5 shadow-card lg:col-span-2"
            style={{ animationDelay: "180ms" }}
          >
            <div className="font-bold">Metode Pembayaran</div>
            {Object.keys(stats.byMethod).length === 0 ? (
              <EmptyHint text="Belum ada transaksi di periode ini." />
            ) : (
              <div className="mt-4 space-y-4">
                {Object.entries(stats.byMethod)
                  .sort((a, b) => b[1] - a[1])
                  .map(([method, total], i) => {
                    const pct = Math.round((total / stats.revenue) * 100);
                    return (
                      <div key={method}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{method}</span>
                          <span className="font-bold">
                            {formatRupiah(total)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cream-100">
                          <div
                            style={{
                              width: `${pct}%`,
                              animationDelay: `${250 + i * 100}ms`,
                            }}
                            className="anim-grow-right h-full rounded-full bg-accent-500"
                          />
                        </div>
                        <div className="mt-0.5 text-right text-[11px] text-cocoa-800/40">
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Produk terlaris */}
          <section
            className="anim-fade-up rounded-2xl bg-white p-5 shadow-card"
            style={{ animationDelay: "240ms" }}
          >
            <div className="font-bold">🏆 Produk Terlaris</div>
            {stats.top.length === 0 ? (
              <EmptyHint text="Belum ada penjualan." />
            ) : (
              <div className="mt-4 space-y-3">
                {stats.top.map(([name, d], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0
                          ? "bg-accent-500 text-white"
                          : "bg-cream-100 text-cocoa-800/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {name}
                      </div>
                      <div className="text-[11px] text-cocoa-800/40">
                        {formatRupiah(d.revenue)}
                      </div>
                    </div>
                    <span className="text-sm font-bold">{d.qty}x</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Stok menipis */}
          <section
            className="anim-fade-up rounded-2xl bg-white p-5 shadow-card"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold">⚠️ Stok Menipis</div>
              <Link
                href="/produk"
                className="text-xs font-semibold text-accent-600 hover:underline"
              >
                Kelola →
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <EmptyHint text="Semua stok aman. 👍" />
            ) : (
              <div className="mt-4 space-y-2.5">
                {lowStock.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl bg-red-50 px-3 py-2"
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {p.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        p.stock === 0
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.stock === 0 ? "Habis" : `Sisa ${p.stock}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Transaksi terakhir */}
          <section
            className="anim-fade-up rounded-2xl bg-white p-5 shadow-card"
            style={{ animationDelay: "360ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold">🕘 Transaksi Terakhir</div>
              <Link
                href="/riwayat"
                className="text-xs font-semibold text-accent-600 hover:underline"
              >
                Semua →
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyHint text="Belum ada transaksi." />
            ) : (
              <div className="mt-4 space-y-2.5">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{t.id}</div>
                      <div className="text-[11px] text-cocoa-800/40">
                        {formatDateTime(t.createdAt)}
                      </div>
                    </div>
                    {t.status === "REFUND" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                        REFUND
                      </span>
                    )}
                    <span
                      className={`text-sm font-bold ${
                        t.status === "REFUND"
                          ? "text-cocoa-800/30 line-through"
                          : ""
                      }`}
                    >
                      {formatRupiah(t.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyHint({ text }) {
  return (
    <div className="mt-6 rounded-xl bg-cream-50 px-4 py-6 text-center text-sm text-cocoa-800/40">
      {text}
    </div>
  );
}
