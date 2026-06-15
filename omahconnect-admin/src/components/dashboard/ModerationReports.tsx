import { AlertTriangle, FileWarning, ShieldAlert } from "lucide-react";
import { moderationItems } from "../../data/mockData";

const icons = [AlertTriangle, FileWarning, ShieldAlert];

export function ModerationReports() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Moderation & Reports
      </h2>

      <div className="space-y-3">
        {moderationItems.map((item, i) => {
          const Icon = icons[i];
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${item.bg}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
              </div>
              <span className={`text-lg font-bold ${item.color}`}>
                {item.count}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-4 text-sm font-medium text-blue-600 hover:underline"
      >
        Go to Moderation Panel →
      </button>
    </div>
  );
}
