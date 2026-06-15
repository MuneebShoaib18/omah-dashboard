import { Header } from "../components/layout/Header";
import { KpiCards } from "../components/dashboard/KpiCards";
import { AnalyticsOverview } from "../components/dashboard/AnalyticsOverview";
import { HiringPipeline } from "../components/dashboard/HiringPipeline";
import { RecentUsers } from "../components/dashboard/RecentUsers";
import { CommunicationCenter } from "../components/dashboard/CommunicationCenter";
import { ModerationReports } from "../components/dashboard/ModerationReports";
import { SystemHealth } from "../components/dashboard/SystemHealth";
import { SettingsSummary } from "../components/dashboard/SettingsSummary";

export function DashboardPage() {
  return (
    <>
      <Header />
      <KpiCards />

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AnalyticsOverview />
        </div>
        <div>
          <HiringPipeline />
        </div>
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentUsers />
        </div>
        <div className="space-y-6">
          <CommunicationCenter />
          <ModerationReports />
          <SystemHealth />
        </div>
      </div>

      <SettingsSummary />
    </>
  );
}
