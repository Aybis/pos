"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUI } from "@/context/UIContext";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    icon: "👨‍💼",
    desc: "Akses penuh: kasir, produk, stok, laporan, pengaturan",
  },
  {
    id: "pegawai",
    label: "Pegawai",
    icon: "🧑‍🍳",
    desc: "Akses kasir & riwayat transaksi",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { hydrated } = useUI();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const storeName = useSettingsStore((s) => s.settings.storeName);

  const [role, setRole] = useState("admin");
  const [name, setName] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/");
  }, [hydrated, user, router]);

  if (!hydrated) return null;

  function submit() {
    login({
      name: name.trim() || (role === "admin" ? "Admin" : "Kasir"),
      role,
    });
    router.replace("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-[36rem] rotate-[18deg] rounded-[4rem] bg-peach-300/50" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-[32rem] -rotate-12 rounded-[4rem] bg-peach-300/40" />

      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-panel">
        <div className="text-center">
          <div className="text-4xl">🏪</div>
          <h1 className="mt-2 text-2xl font-extrabold">{storeName}</h1>
          <p className="mt-1 text-sm text-cocoa-800/50">
            Masuk untuk mulai berjualan
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                role === r.id
                  ? "border-accent-500 bg-peach-100"
                  : "border-cream-200 hover:border-accent-400"
              }`}
            >
              <span className="text-3xl">{r.icon}</span>
              <span>
                <span className="block font-bold">{r.label}</span>
                <span className="block text-xs text-cocoa-800/50">
                  {r.desc}
                </span>
              </span>
              <span
                className={`ml-auto flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  role === r.id
                    ? "border-accent-500 bg-accent-500 text-xs text-white"
                    : "border-cream-300"
                }`}
              >
                {role === r.id && "✓"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-semibold">
            Nama (opsional)
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={role === "admin" ? "Contoh: Ama" : "Contoh: Budi"}
            className="w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-accent-400"
          />
        </div>

        <button
          onClick={submit}
          className="mt-6 w-full rounded-2xl bg-cocoa-800 py-4 font-bold text-white transition hover:bg-cocoa-700"
        >
          Masuk sebagai {role === "admin" ? "Admin" : "Pegawai"}
        </button>
      </div>
    </div>
  );
}
