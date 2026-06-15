import { LineChart, Line, ResponsiveContainer } from "recharts";

const sparkData = [
  { v: 99.9 },
  { v: 99.95 },
  { v: 99.98 },
  { v: 99.97 },
  { v: 99.98 },
];

export function SystemHealth() {
  const items = [
    { label: "API Status", value: "Operational", status: "healthy" as const },
    { label: "Server Health", value: "Healthy", status: "healthy" as const },
    { label: "Database Status", value: "Healthy", status: "healthy" as const },
    { label: "Error Count", value: "7", status: "warning" as const },
    { label: "Uptime", value: "99.98%", status: "healthy" as const },
  ];

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        System Health
      </h2>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  item.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="font-medium text-slate-800">{item.value}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between">
        <ResponsiveContainer width={120} height={40}>
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View System Metrics →
        </button>
      </div>
    </div>
  );
}
