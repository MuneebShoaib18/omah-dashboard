import { MoreHorizontal } from "lucide-react";
import { recentUsers } from "../../data/mockData";

export function RecentUsers() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Recent Users</h2>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          View All Users
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Company</th>
              <th className="pb-2 font-medium">Last Active</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.email} className="border-b border-slate-50">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-slate-600">{user.role}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 text-slate-600">{user.company}</td>
                <td className="py-3 text-slate-500">{user.lastActive}</td>
                <td className="py-3">
                  <button
                    type="button"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
