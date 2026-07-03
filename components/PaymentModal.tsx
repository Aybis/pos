"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";
import Receipt from "./Receipt";

interface PaymentModalProps {
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  onConfirm: (payment: {
    paymentMethod: string;
    paidAmount?: number;
    change?: number;
  }) => { id: string; paymentMethod: string };
  onDone: () => void;
  onClose: () => void;
}

interface Transaction {
  id: string;
  paymentMethod: string;
}

const METHODS = [
  { id: "Tunai", icon: "💵", desc: "Bayar langsung di kasir" },
  { id: "QRIS", icon: "📱", desc: "Scan QR (simulasi)" },
  { id: "Kartu Debit", icon: "💳", desc: "Gesek kartu (simulasi)" },
  { id: "E-Wallet", icon: "👛", desc: "GoPay/OVO/Dana (simulasi)" },
];

type Step = "method" | "cash" | "qris" | "processing" | "success";

function qrPattern(seedNumber: number): boolean[] {
  const cells: boolean[] = [];
  let seed = seedNumber || 1;
  for (let i = 0; i < 21 * 21; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.5);
  }
  return cells;
}

export default function PaymentModal({ totals, onConfirm, onDone, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<string | null>(null);
  const [cash, setCash] = useState("");
  const [trx, setTrx] = useState<Transaction | null>(null);

  const cashNum = Number(cash) || 0;
  const change = cashNum - totals.total;

  function pickMethod(m: string) {
    setMethod(m);
    if (m === "Tunai") setStep("cash");
    else if (m === "QRIS") setStep("qris");
    else startProcessing(m, totals.total, 0);
  }

  function startProcessing(m: string, paidAmount: number, changeAmount: number) {
    setStep("processing");
    setTimeout(() => {
      const record = onConfirm({ paymentMethod: m, paidAmount, change: changeAmount });
      setTrx(record);
      setStep("success");
    }, 1800);
  }

  useEffect(() => {
    if (step !== "qris") return;
    const t = setTimeout(() => startProcessing("QRIS", totals.total, 0), 4000);
    return () => clearTimeout(t);
  }, [step]);

  const quickCash = [totals.total, 20000, 50000, 100000].filter(
    (v, i, arr) => arr.indexOf(v) === i && v >= totals.total
  );

  return (
    <div
      className="anim-fade-in fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 sm:items-center sm:p-4 print:bg-transparent"
      onClick={step === "success" || step === "processing" ? undefined : onClose}
    >
      <div
        className="anim-scale-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-panel sm:rounded-3xl print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "method" && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Pilih Pembayaran</div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100">
                ✕
              </button>
            </div>
            <div className="mt-1 text-sm text-cocoa-800/60">
              Total tagihan{" "}
              <span className="font-bold text-cocoa-800">
                {formatRupiah(totals.total)}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => pickMethod(m.id)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-cream-200 p-4 text-left transition hover:border-accent-400 hover:bg-cream-50"
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span>
                    <span className="block font-semibold">{m.id}</span>
                    <span className="block text-xs text-cocoa-800/50">
                      {m.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "cash" && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">💵 Pembayaran Tunai</div>
              <button onClick={() => setStep("method")} className="text-sm text-accent-600 hover:underline">
                ← Kembali
              </button>
            </div>
            <div className="mt-4 rounded-2xl bg-cream-50 p-4 text-center">
              <div className="text-xs text-cocoa-800/50">Total Tagihan</div>
              <div className="text-2xl font-extrabold">
                {formatRupiah(totals.total)}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold">Uang Diterima</div>
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full rounded-xl border border-cream-200 px-4 py-3 text-lg font-bold outline-none focus:border-accent-400"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quickCash.map((v) => (
                  <button
                    key={v}
                    onClick={() => setCash(String(v))}
                    className="rounded-lg bg-cream-100 px-3 py-1.5 text-sm font-medium hover:bg-cream-200"
                  >
                    {v === totals.total ? "Uang Pas" : formatRupiah(v)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-cocoa-800/60">Kembalian</span>
              <span
                className={`font-bold ${
                  change < 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {formatRupiah(Math.max(0, change))}
              </span>
            </div>
            <button
              onClick={() => startProcessing("Tunai", cashNum, change)}
              disabled={change < 0 || !cash}
              className="mt-5 w-full rounded-xl bg-cocoa-800 py-3.5 font-semibold text-white hover:bg-cocoa-700 disabled:opacity-40"
            >
              Konfirmasi Pembayaran
            </button>
          </>
        )}

        {step === "qris" && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">📱 Scan QRIS</div>
              <button onClick={() => setStep("method")} className="text-sm text-accent-600 hover:underline">
                ← Kembali
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <div className="rounded-2xl border-4 border-cocoa-800 p-3">
                <div className="grid w-48 grid-cols-[repeat(21,1fr)]">
                  {qrPattern(totals.total).map((on, i) => (
                    <div
                      key={i}
                      className={`aspect-square ${on ? "bg-cocoa-900" : "bg-white"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold">
                {formatRupiah(totals.total)}
              </div>
              <div className="mt-1 animate-pulse text-sm text-cocoa-800/50">
                Menunggu pelanggan scan... (simulasi otomatis)
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center py-10">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-cream-200 border-t-accent-500" />
            <div className="mt-5 font-semibold">Memproses pembayaran...</div>
            <div className="mt-1 text-sm text-cocoa-800/50">
              Menghubungi payment gateway (dummy)
            </div>
          </div>
        )}

        {step === "success" && trx && (
          <>
            <div className="flex flex-col items-center print:hidden">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✅
              </div>
              <div className="mt-3 text-lg font-bold">Pembayaran Berhasil!</div>
              <div className="text-sm text-cocoa-800/50">
                {trx.id} · {trx.paymentMethod}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-cream-200">
              <Receipt trx={trx as any} />
            </div>
            <div className="mt-4 flex gap-3 print:hidden">
              <button onClick={() => window.print()} className="flex-1 rounded-xl border border-cocoa-800 py-3 font-semibold hover:bg-cream-50">
                🖨️ Cetak Struk
              </button>
              <button onClick={onDone} className="flex-1 rounded-xl bg-cocoa-800 py-3 font-semibold text-white hover:bg-cocoa-700">
                Transaksi Baru
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}