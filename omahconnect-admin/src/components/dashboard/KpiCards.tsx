import { TrendingUp } from "lucide-react";
import { kpiCards } from "../../data/mockData";

export function KpiCards() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
      {kpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div
              className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
            >
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="font-medium text-emerald-600">{card.change}</span>
              <span className="truncate text-slate-400">{card.period}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
