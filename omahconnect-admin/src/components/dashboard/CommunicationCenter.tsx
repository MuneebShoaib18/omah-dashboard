import { Wrench, Sparkles, BookOpen } from "lucide-react";
import { communications } from "../../data/mockData";

const iconMap = {
  wrench: Wrench,
  sparkles: Sparkles,
  book: BookOpen,
};

export function CommunicationCenter() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Communication Center
        </h2>
        <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
          View All
        </button>
      </div>

      <ul className="space-y-4">
        {communications.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <li key={item.title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                <p className="mt-1 text-xs text-slate-400">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="mt-4 text-sm font-medium text-blue-600 hover:underline"
      >
        Send Announcement →
      </button>
    </div>
  );
}
