import { TrendingUp } from "lucide-react";
import { pipelineStages } from "../../data/mockData";

export function HiringPipeline() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        Hiring Pipeline (Applications)
      </h2>

      <div className="mb-6 grid grid-cols-4 gap-2">
        {pipelineStages.map((stage) => (
          <div key={stage.stage} className="text-center">
            <div
              className={`rounded-lg py-3 text-xs font-semibold text-white ${stage.color}`}
            >
              {stage.count.toLocaleString()}
            </div>
            <span className="mt-2 block text-xs font-medium text-slate-600">
              {stage.stage}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="pb-2 font-medium">Stage</th>
              <th className="pb-2 font-medium">Count</th>
              <th className="pb-2 font-medium">% of Total</th>
              <th className="pb-2 font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {pipelineStages.map((row) => (
              <tr key={row.stage} className="border-b border-slate-50">
                <td className="py-2.5">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${row.color}`} />
                    {row.stage}
                  </span>
                </td>
                <td className="py-2.5 font-medium text-slate-800">
                  {row.count.toLocaleString()}
                </td>
                <td className="py-2.5 text-slate-600">{row.percent}%</td>
                <td className="py-2.5">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {row.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
