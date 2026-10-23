"use client";

import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import { apiRequest } from "../lib/api";

function SectionHeading({ title, subtitle, href, linkLabel }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {href && (
        <a
          href={href}
          className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          {linkLabel} →
        </a>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-blue-50 text-blue-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Overdue: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/dashboard");

        if (!result?.success || !result?.data) {
          throw new Error("Invalid dashboard API response.");
        }

        setStats(result.data.stats ?? []);
        setRecentTransactions(result.data.recentTransactions ?? []);
        setPopularBooks(result.data.popularBooks ?? []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />

        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Your library at a glance
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Good evening, Librarian.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Manage your collection, keep track of borrowing activity, and help
            your members find their next great read.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/books"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Explore books <span className="ml-2">→</span>
            </a>

            <a
              href="/transactions"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View transactions
            </a>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <p className="font-semibold">Could not load dashboard data</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2">
            Check that the backend is running and the dashboard API route is registered.
          </p>
        </div>
      )}

      <section>
        <SectionHeading
          title="Library overview"
          subtitle="A snapshot of your library's activity."
        />

        {loading ? (
          <p className="py-6 text-sm text-slate-500">
            Loading library statistics...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Recent transactions"
            subtitle="Latest book issue and return activity."
            href="/transactions"
            linkLabel="View all"
          />

          {loading ? (
            <p className="py-6 text-sm text-slate-500">
              Loading transactions...
            </p>
          ) : recentTransactions.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No transactions found yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-y border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3 pr-4 font-semibold">Member / Book</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((transaction) => {
                    const memberName = transaction.member || "Unknown member";
                    const initials = memberName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase();

                    const date = transaction.date
                      ? new Date(transaction.date).toLocaleDateString()
                      : "—";

                    return (
                      <tr key={transaction.id}>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                              {initials || "?"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {memberName}
                              </p>
                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                {transaction.book || "Unknown book"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                          {date}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={transaction.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            title="Popular books"
            subtitle="Frequently borrowed titles."
            href="/books"
            linkLabel="View books"
          />

          {loading ? (
            <p className="py-6 text-sm text-slate-500">
              Loading popular books...
            </p>
          ) : popularBooks.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              No borrowing activity yet.
            </p>
          ) : (
            <div className="space-y-5">
              {popularBooks.map((book, index) => {
                const total = Number(book.total) || 0;
                const issued = Number(book.issued) || 0;
                const available = Number(book.available) || 0;

                const borrowedPercent =
                  total > 0
                    ? Math.min(100, Math.round((issued / total) * 100))
                    : 0;

                return (
                  <div key={book.id || book.title}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-lg text-emerald-800">
                        {["▤", "⌘", "◫", "▧"][index % 4]}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {book.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {book.author} · {book.category}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{issued} issued</span>
                      <span>{available} available</span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${borrowedPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="pb-2 text-center text-xs text-slate-400">
        LibraDesk · Smarter library management
      </footer>
    </div>
  );
}
