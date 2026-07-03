"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiMenu,
  FiChevronsRight,
  FiChevronDown,
  FiClock,
  FiBox,
  FiBarChart2,
  FiSettings,
  FiSearch,
  FiLock,
  FiArrowLeft,
  FiShoppingBag,
} from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useProductStore } from "@/store/useProductStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUI } from "@/context/UIContext";

const PAGES: Record<string, { title: string; adminOnly: boolean; kasirOnly: boolean }> = {
  "/": { title: "Kasir", adminOnly: false, kasirOnly: true },
  "/produk": { title: "Produk", adminOnly: true, kasirOnly: false },
  "/riwayat": { title: "Riwayat Transaksi", adminOnly: false, kasirOnly: false },
  "/laporan": { title: "Dashboard", adminOnly: true, kasirOnly: false },
  "/pengaturan": { title: "Pengaturan", adminOnly: true, kasirOnly: false },
};

interface NavIcon {
  href: string;
  Icon: React.ComponentType<{ size: number }>;
  label: string;
  adminOnly: boolean;
  kasirOnly?: boolean;
}

const NAV_ICONS: NavIcon[] = [
  { href: "/riwayat", Icon: FiClock, label: "Riwayat", adminOnly: false },
  { href: "/produk", Icon: FiBox, label: "Produk", adminOnly: true },
  { href: "/laporan", Icon: FiBarChart2, label: "Dashboard", adminOnly: true },
  { href: "/pengaturan", Icon: FiSettings, label: "Pengaturan", adminOnly: true },
];

interface CategorySidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function CategorySidebar({ collapsed, onToggle }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const categories = useProductStore((s) => s.categories);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const setActiveCategory = useUIStore((s) => s.setActiveCategory);

  function pick(id: string) {
    setActiveCategory(id);
    if (pathname !== "/") router.push("/");
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col items-center bg-cocoa-800 py-6 transition-all duration-300 ease-out md:flex print:hidden ${
        collapsed ? "w-14" : "w-20"
      }`}
    >
        <button
          onClick={onToggle}
          title={collapsed ? "Perlebar menu" : "Perkecil menu"}
          className="anim-btn-press anim-btn-hover flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
        >
        {collapsed ? <FiChevronsRight size={18} /> : <FiMenu size={18} />}
      </button>

      <nav
        className={`mt-4 flex w-full flex-1 flex-col-reverse items-center justify-center gap-2 overflow-y-auto py-4 transition-opacity duration-200 ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <button
          onClick={() => pick("all")}
          className={`anim-nav-item vertical-text rounded-full px-2 py-3 text-sm tracking-wide transition ${
            activeCategory === "all" && pathname === "/"
              ? "font-bold text-white"
              : "text-white/40 hover:text-white/80"
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => pick(c.id)}
            className={`anim-nav-item vertical-text rounded-full px-2 py-3 text-sm tracking-wide transition ${
              activeCategory === c.id && pathname === "/"
                ? "font-bold text-white"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            {c.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const categories = useProductStore((s) => s.categories);
  const activeCategory = useUIStore((s) => s.activeCategory);
  const search = useUIStore((s) => s.search);
  const setSearch = useUIStore((s) => s.setSearch);
  const [menuOpen, setMenuOpen] = useState(false);

  const isKasir = pathname === "/";
  const isAdmin = user?.role === "admin";
  const homeHref = isAdmin ? "/laporan" : "/";
  const homeLabel = isAdmin ? "Dashboard" : "Kasir";
  const title = isKasir
    ? activeCategory === "all"
      ? "Semua"
      : categories.find((c) => c.id === activeCategory)?.name || "Menu"
    : PAGES[pathname]?.title || "POS";

  return (
    <header className="flex items-center gap-3 px-5 pb-2 pt-6 md:px-8 print:hidden">
      <h1 className="shrink-0 text-2xl font-extrabold md:text-3xl">{title}</h1>

      {isKasir && (
        <div className="relative mx-2 hidden max-w-xl flex-1 sm:block md:mx-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cocoa-800/30">
            <FiSearch size={16} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, makanan, dll"
            className="w-full rounded-full border border-cream-200 bg-white py-3 pl-11 pr-4 text-sm shadow-card outline-none placeholder:text-cocoa-800/30 focus:border-accent-400"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {NAV_ICONS.filter((n) => isAdmin || !n.adminOnly).map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            title={n.label}
            className="anim-nav-item anim-btn-hover hidden h-11 w-11 items-center justify-center rounded-full bg-white text-cocoa-800/70 shadow-card sm:flex"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <n.Icon size={18} />
          </Link>
        ))}
        {!isKasir && (
          <Link
            href={homeHref}
            className="anim-nav-item anim-btn-hover hidden h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold shadow-card sm:flex"
          >
            <FiArrowLeft size={15} /> {homeLabel}
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="anim-btn-press flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-3 shadow-card transition hover:shadow-panel"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              {user?.role === "admin" ? "Admin" : "Kasir"}
            </span>
            <span className="text-cocoa-800/40">
              <FiChevronDown size={14} />
            </span>
          </button>
          {menuOpen && (
            <div className="anim-dropdown absolute right-0 top-12 z-50 w-44 rounded-2xl bg-white p-2 shadow-panel">
              <div className="px-3 py-2 text-xs text-cocoa-800/50">
                Masuk sebagai{" "}
                <span className="font-semibold text-cocoa-800">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  router.replace("/login");
                }}
                className="anim-btn-press w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const items: { href: string; label: string; Icon: React.ComponentType<{ size: number }> }[] = [
    ...(isAdmin
      ? [{ href: "/laporan", label: "Dashboard", Icon: FiBarChart2 }]
      : [{ href: "/", label: "Kasir", Icon: FiShoppingBag }]),
    ...NAV_ICONS.filter((n) => (isAdmin || !n.adminOnly) && n.href !== "/laporan").map((n) => ({
      href: n.href,
      label: n.label,
      Icon: n.Icon,
    })),
  ];
  return (
    <nav className="flex justify-around border-t border-cream-200 bg-white py-1.5 md:hidden print:hidden">
      {items.map((m, i) => (
        <Link
          key={m.href}
          href={m.href}
          className={`anim-nav-item flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] ${
            pathname === m.href
              ? "font-bold text-accent-600"
              : "text-cocoa-800/50"
          }`}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <m.Icon size={18} />
          {m.label}
        </Link>
      ))}
    </nav>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated } = useUI();
  const user = useAuthStore((s) => s.user);
  const storeName = useSettingsStore((s) => s.settings.storeName);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (hydrated && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [hydrated, user, pathname, router]);

  if (pathname === "/login") return children;

  if (!hydrated || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6">
        <div className="pos-loader-mark flex h-16 w-16 items-center justify-center rounded-3xl bg-cocoa-800 text-2xl shadow-panel">
          🧾
        </div>
        <div className="pos-loader" aria-label="Memuat">
          <span />
          <span />
          <span />
        </div>
        <p className="pos-loader-text text-sm font-medium tracking-wide text-cocoa-800/40">
          Memuat POS...
        </p>
      </div>
    );
  }

  const page = PAGES[pathname];
  const isAdmin = user?.role === "admin";
  const homeHref = isAdmin ? "/laporan" : "/";
  const homeLabel = isAdmin ? "Dashboard" : "Kasir";
  const blocked =
    (page?.adminOnly && user.role !== "admin") ||
    (page?.kasirOnly && user.role !== "kasir");

  return (
    <div className="relative min-h-screen overflow-hidden p-3 md:p-6 lg:p-8 print:p-0">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-[36rem] rotate-[18deg] rounded-[4rem] bg-peach-300/50 print:hidden" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-[32rem] -rotate-12 rounded-[4rem] bg-peach-300/40 print:hidden" />
      <div className="pointer-events-none absolute bottom-6 right-8 hidden gap-2 lg:flex print:hidden">
        <div className="h-14 w-3 rotate-[30deg] rounded-full bg-accent-500/70" />
        <div className="h-14 w-3 rotate-[30deg] rounded-full bg-accent-500/70" />
      </div>

      <div className="relative mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-panel md:h-[calc(100vh-3rem)] md:rounded-[2.5rem] lg:h-[calc(100vh-4rem)] print:h-auto print:overflow-visible print:rounded-none print:shadow-none">
        <div className="flex min-h-0 flex-1">
          <CategorySidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Topbar />
            <div key={pathname} className="anim-fade-in min-h-0 flex-1 overflow-hidden">
              {blocked ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cream-100 text-cocoa-800/60">
                    <FiLock size={28} />
                  </div>
                  <div className="mt-3 text-lg font-bold">
                    {page?.kasirOnly ? "Khusus Kasir" : "Khusus Admin"}
                  </div>
                  <p className="mt-1 max-w-sm text-sm text-cocoa-800/50">
                    Halaman ini hanya bisa diakses oleh {page?.kasirOnly ? "Kasir" : "Admin"} {storeName}.
                    Silakan masuk ulang sebagai {page?.kasirOnly ? "Kasir" : "Admin"}.
                  </p>
                  <Link
                    href={homeHref}
                    className="mt-5 rounded-full bg-cocoa-800 px-6 py-3 text-sm font-semibold text-white"
                  >
                    Kembali ke {homeLabel}
                  </Link>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}