import { useEffect, useState, useMemo } from "react";
import { fetchCompanyLogs, type CompanyLog } from "../services/api";
import { Header } from "../components/layout/Header";
import {
  Shield,
  UserCheck,
  Lock,
  Database,
  Save,
  Check,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "System Developer" | "Moderator";
  status: "Active" | "Inactive";
  twoFactor: boolean;
}

interface PermissionRole {
  name: string;
  manageUsers: boolean;
  verifyCompanies: boolean;
  modifySettings: boolean;
  dbBackup: boolean;
}

export function SettingsPage() {
  const [logs, setLogs] = useState<CompanyLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Form saved status banner
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Security toggles
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [oktaSso, setOktaSso] = useState(false);
  const [googleSso, setGoogleSso] = useState(true);

  // Admin users state
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: "a1", name: "Admin User", email: "admin@omahconnect.com", role: "Super Admin", status: "Active", twoFactor: true },
    { id: "a2", name: "Bruce Wayne", email: "developer@omahconnect.com", role: "System Developer", status: "Active", twoFactor: true },
    { id: "a3", name: "Sarah Connor", email: "moderator@omahconnect.com", role: "Moderator", status: "Active", twoFactor: false },
  ]);

  // Roles permissions matrix state
  const [roleMatrix, setRoleMatrix] = useState<PermissionRole[]>([
    { name: "Super Admin", manageUsers: true, verifyCompanies: true, modifySettings: true, dbBackup: true },
    { name: "System Developer", manageUsers: true, verifyCompanies: false, modifySettings: true, dbBackup: true },
    { name: "Moderator", manageUsers: true, verifyCompanies: true, modifySettings: false, dbBackup: false },
  ]);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoadingLogs(true);
        const data = await fetchCompanyLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoadingLogs(false);
      }
    }
    loadLogs();
  }, []);

  const handleToggleTfa = (id: string) => {
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === id ? { ...adm, twoFactor: !adm.twoFactor } : adm))
    );
  };

  const handleMatrixChange = (roleName: string, field: keyof Omit<PermissionRole, "name">) => {
    setRoleMatrix((prev) =>
      prev.map((r) => (r.name === roleName ? { ...r, [field]: !r[field] } : r))
    );
  };

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  // filter security logs specifically
  const securityLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.targetType === "settings" ||
        log.targetType === "communication" ||
        log.action.toLowerCase().includes("suspend") ||
        log.action.toLowerCase().includes("verify")
    );
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header title="Settings & Permissions Hub" />

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 -mt-3 pb-2 border-b border-slate-100">
        <p className="text-sm text-slate-500">
          Configure security protocols, manage moderator privileges, assign role matrices, and audit system authorization trails.
        </p>
        <div className="flex items-center gap-1.5 shrink-0 text-emerald-600 font-semibold text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ENCRYPTION STANDARD SHA-256
        </div>
      </div>

      {showSavedMsg && (
        <div className="rounded-xl border border-emerald-250 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center gap-2">
          <Check className="h-4 w-4" /> Global security settings updated and synchronized with network configuration.
        </div>
      )}

      {/* Grid: Admins list & Role Matrix */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* Admin directories */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-slate-800 text-xs">Admin Account Directory</span>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-lg bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-455 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2">Administrator</th>
                  <th className="px-4 py-2">Role Title</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">2FA Shield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-800">{adm.name}</span>
                        <span className="block text-[10px] text-slate-400">{adm.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-650">{adm.role}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-55 font-bold text-emerald-600 text-[10px] px-1.5 py-0.5">
                        {adm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleTfa(adm.id)}
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                          adm.twoFactor
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {adm.twoFactor ? "SECURED" : "OFF (Toggle)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Permission Matrix Grid */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="h-4 w-4 text-violet-500" />
            <span className="font-bold text-slate-800 text-xs">Access Control Permissions Matrix</span>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-lg bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-455 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2">Role Name</th>
                  <th className="px-4 py-2 text-center">Edit Users</th>
                  <th className="px-4 py-2 text-center">Verify Firm</th>
                  <th className="px-4 py-2 text-center">Settings</th>
                  <th className="px-4 py-2 text-center">Dev tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                {roleMatrix.map((role) => (
                  <tr key={role.name} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{role.name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={role.manageUsers}
                        onChange={() => handleMatrixChange(role.name, "manageUsers")}
                        className="rounded border-slate-300 text-blue-600 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={role.verifyCompanies}
                        onChange={() => handleMatrixChange(role.name, "verifyCompanies")}
                        className="rounded border-slate-300 text-blue-600 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={role.modifySettings}
                        onChange={() => handleMatrixChange(role.name, "modifySettings")}
                        className="rounded border-slate-300 text-blue-600 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={role.dbBackup}
                        onChange={() => handleMatrixChange(role.name, "dbBackup")}
                        className="rounded border-slate-300 text-blue-600 accent-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Security configurations and Audit Logs row */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Security parameters */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Lock className="h-4 w-4 text-rose-500" />
            <span className="font-bold text-slate-800 text-xs">Security & Gateway Settings</span>
          </div>

          <form onSubmit={handleSubmitSettings} className="space-y-4 text-xs text-slate-650 flex-1 flex flex-col justify-between pt-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="font-semibold text-slate-800">Enforce Two-Factor Authentication</div>
                  <p className="text-[10px] text-slate-400">Force all moderators to register verification tokens.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTfaEnabled(!tfaEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    tfaEnabled ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    tfaEnabled ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="border-b border-slate-100 pb-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-800">Session Timeout Threshold</div>
                  <span className="font-mono font-bold text-blue-600 text-xs">{sessionTimeout} minutes</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="font-semibold text-slate-800">SSO: Okta Client Directory Integration</div>
                  <p className="text-[10px] text-slate-400">Redirect login sessions to SAML gateway.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOktaSso(!oktaSso)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    oktaSso ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    oktaSso ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pb-2">
                <div>
                  <div className="font-semibold text-slate-800">SSO: Google Workspace Federation</div>
                  <p className="text-[10px] text-slate-400">Authorize logins using company-registered email groups.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleSso(!googleSso)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    googleSso ? "bg-blue-600" : "bg-slate-200"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    googleSso ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-4">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-550 shadow-sm"
              >
                <Save className="h-3.5 w-3.5" /> Save Security Policies
              </button>
            </div>
          </form>
        </div>

        {/* Security Audit logs list */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-slate-800 text-xs">Security Audit Logs</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Audit Active</span>
          </div>

          <div className="overflow-y-auto max-h-[220px] pr-2 space-y-3 scrollbar-thin">
            {loadingLogs ? (
              <div className="text-center py-12 text-slate-400 text-xs">Querying audit logs...</div>
            ) : securityLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No recent security events registered.</div>
            ) : (
              securityLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{log.adminName}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-650 font-medium">{log.action}</p>
                  <p className="text-[9px] text-slate-405">
                    Target: {log.targetType.toUpperCase()} ({log.targetName})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
