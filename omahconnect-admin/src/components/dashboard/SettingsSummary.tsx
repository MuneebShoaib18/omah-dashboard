import {
  Shield,
  Key,
  Lock,
  Users,
  Layers,
} from "lucide-react";
import { settingsSummary } from "../../data/mockData";

const settingIcons = [Users, Layers, Key, Shield, Lock];

export function SettingsSummary() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-wrap gap-6">
        {settingsSummary.map((item, i) => {
          const Icon = settingIcons[i];
          return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">{item.label}:</span>
              <span className="text-sm font-semibold text-slate-800">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Manage Settings
      </button>
    </div>
  );
}
