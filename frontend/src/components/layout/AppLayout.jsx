
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Books", href: "/books", icon: "▤" },
  { label: "Members", href: "/members", icon: "♙" },
  { label: "Transactions", href: "/transactions", icon: "⇄" },
];

function Sidebar({ pathname, onNavigate }) {
  return (
    <aside className="flex h-full w-full flex-col bg-slate-950 text-slate-300">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
          L
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">
            LibraDesk
          </p>
          <p className="text-xs text-slate-400">Library management</p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-400 font-semibold text-slate-950 shadow-lg shadow-emerald-950/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-6 text-center text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-950" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPage =
    navigation.find((item) => item.href === pathname)?.label ||
    navigation.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href + "/")
    )?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="min-h-screen md:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl hover:bg-slate-50 md:hidden"
            >
              ☰
            </button>

            <div className="min-w-0">
             
              <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                {currentPage}
              </h1>
            </div>
          </div>

        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
