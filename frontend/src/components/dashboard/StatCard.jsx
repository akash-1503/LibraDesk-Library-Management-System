
import {
  BookOpen,
  Users,
  BookCheck,
  ClockAlert,
} from "lucide-react";

const iconMap = {
  "Total Books": BookOpen,
  "Total Members": Users,
  "Books Issued": BookCheck,
  "Overdue Books": ClockAlert,
};

export default function StatCard({ stat }) {
  const Icon = iconMap[stat.label] || BookOpen;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            {stat.value}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
          <Icon
            size={25}
            strokeWidth={1.8}
            className="text-emerald-600"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs font-medium text-emerald-600">
        <span aria-hidden="true">↗</span>
        <span>Library overview</span>
      </div>
    </div>
  );
}
