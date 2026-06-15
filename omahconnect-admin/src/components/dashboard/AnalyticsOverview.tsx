import { ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { userGrowthData, engagementData } from "../../data/mockData";

export function AnalyticsOverview() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Analytics Overview
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          Last 30 Days
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">User Growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Users"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="active"
                name="Active Users"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Engagement Overview
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" name="Likes" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shares" name="Shares" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
