import { useEffect, useMemo, useState } from "react";
import { fetchApplications, updateApplicationStatus, deleteApplication, syncGoogleSheet, fetchCompanySettings, type Application } from "../services/api";
import { Header } from "../components/layout/Header";
import { Search, Eye, Download, Calendar, X, FileText, Mail, Trash2, Share2, RefreshCw, HelpCircle, Loader2 } from "lucide-react";

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchCompanySettings();
        if (settings.googleSheetSyncUrl) {
          setSheetUrlInput(settings.googleSheetSyncUrl);
        }
      } catch (err) {
        console.error("Failed to load settings in ApplicationsPage:", err);
      }
    }
    loadSettings();
  }, []);

  // Filters & Search Queries
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const uniqueCompanies = useMemo(() => {
    const comps = new Set(applications.map((app) => app.companyName).filter(Boolean));
    return ["All", ...Array.from(comps)];
  }, [applications]);

  // Selected Application for Details Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadApps = async (autoSyncSheet = false) => {
    try {
      setLoading(true);
      setError(null);

      let sheetUrl = sheetUrlInput;
      try {
        const settings = await fetchCompanySettings();
        if (settings.googleSheetSyncUrl) {
          sheetUrl = settings.googleSheetSyncUrl;
          setSheetUrlInput(settings.googleSheetSyncUrl);
        }
      } catch {
        // settings optional
      }

      if (autoSyncSheet && sheetUrl.trim()) {
        try {
          setSyncing(true);
          const result = await syncGoogleSheet(sheetUrl.trim());
          setSyncMessage(`Synced ${result.addedCount} new Google Form response(s).`);
        } catch (err: unknown) {
          const message =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
              : null;
          setSyncMessage(message || "Could not auto-sync Google Form. Use Sync Form Responses to set the sheet URL.");
        } finally {
          setSyncing(false);
        }
      }

      const data = await fetchApplications();
      setApplications(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      setError(
        `${message}. Make sure the backend is running: open a terminal in the OMEH folder and run "npm start".`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps(true);
  }, []);

  const handleSync = async () => {
    if (!sheetUrlInput.trim()) {
      alert("Please enter a valid Google Sheets CSV URL.");
      return;
    }
    try {
      setSyncing(true);
      const result = await syncGoogleSheet(sheetUrlInput.trim());
      alert(`Sync completed successfully! Imported ${result.addedCount} new candidate application(s).`);
      setShowSyncModal(false);
      setSyncMessage(`Imported ${result.addedCount} new Google Form response(s).`);
      await loadApps(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to synchronize Google Sheet responses. Make sure the spreadsheet is published to the web as CSV.");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected') => {
    try {
      await updateApplicationStatus(id, nextStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: nextStatus } : app))
      );
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
      alert(`Candidate pipeline status updated to [${nextStatus.toUpperCase()}]`);
    } catch (err) {
      alert("Failed to update application pipeline status");
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this job application? This action is irreversible.")) {
      try {
        await deleteApplication(id);
        setApplications((prev) => prev.filter((app) => app.id !== id));
        setSelectedApp(null);
        alert("Application record removed successfully.");
      } catch (err) {
        alert("Failed to delete application record.");
      }
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesQuery =
        app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesCompany = companyFilter === "All" || app.companyName === companyFilter;

      const appDate = new Date(app.appliedDate);
      const now = new Date();
      let matchesDate = true;
      if (dateFilter === "7d") {
        matchesDate = now.getTime() - appDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "30d") {
        matchesDate = now.getTime() - appDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }

      return matchesQuery && matchesStatus && matchesCompany && matchesDate;
    });
  }, [applications, searchQuery, statusFilter, companyFilter, dateFilter]);

  if (loading && applications.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 p-12 text-center text-red-600">
        <FileText className="h-10 w-10 text-red-500" />
        <p className="mt-3 font-semibold">Error Loading Applications</p>
        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header title="Candidate Applications Directory" />

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 -mt-3 pb-2 border-b border-slate-100">
        <p className="text-sm text-slate-500">
          Track and advance candidates through pipeline stages. Review cover letters and resume downloads.
          {applications.length > 0 && (
            <span className="ml-2 font-semibold text-slate-700">({applications.length} total)</span>
          )}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => loadApps(true)}
            disabled={syncing || loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            Refresh & Sync
          </button>
          <button
            onClick={() => {
              const url = "https://docs.google.com/forms/d/1M8EpWuPKf0pugFE6rgSq4DNXrXz9sR7rnbjDDpbl02Y/viewform";
              navigator.clipboard.writeText(url);
              alert(`Internship application link copied to clipboard:\n${url}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            Copy Apply Link
          </button>
          <button
            onClick={() => setShowSyncModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Form Responses
          </button>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            PIPELINE SYNCED
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-800">
          {syncMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search candidate name, job title, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Pipeline Stages</option>
            <option value="applied">Applied</option>
            <option value="reviewed">Reviewed</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Companies</option>
            {uniqueCompanies.filter(c => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
              <th className="px-5 py-3.5">Candidate</th>
              <th className="px-5 py-3.5">Target Role</th>
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Date Applied</th>
              <th className="px-5 py-3.5 text-center">Resume</th>
              <th className="px-5 py-3.5">Pipeline Stage</th>
              <th className="px-5 py-3.5">Source</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  {applications.length === 0
                    ? "No applications yet. Click Sync Form Responses to import Google Form data, or share the apply link."
                    : "No applications match the filters."}
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-semibold text-slate-800">{app.userName}</span>
                      <span className="block text-[10px] text-slate-400">{app.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 truncate max-w-[150px]">{app.jobTitle}</td>
                  <td className="px-5 py-4 font-semibold text-blue-600">{app.companyName}</td>
                  <td className="px-5 py-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {app.appliedDate}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 font-bold text-blue-600 hover:text-blue-500"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={app.status}
                      onChange={(e: any) => handleUpdateStatus(app.id, e.target.value)}
                      className={`rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold focus:outline-none ${
                        app.status === "hired"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : app.status === "rejected"
                          ? "text-rose-700 bg-rose-50 border-rose-200"
                          : app.status === "interview"
                          ? "text-blue-700 bg-blue-50 border-blue-200"
                          : "text-slate-700 bg-slate-50"
                      }`}
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      app.userId === "google-form-sync" || app.source === "google-form" || app.source === "csv"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {app.userId === "google-form-sync" || app.source === "google-form" || app.source === "csv"
                        ? "Google Form"
                        : "Direct"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        title="View Details"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        title="Remove Record"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* GOOGLE SPREADSHEET SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Sync Google Form Responses</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                <span className="font-bold">Instructions to publish responses sheet:</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Open the Google Sheet linked to your Google Form.</li>
                  <li>Click <strong>File</strong> &rarr; <strong>Share</strong> &rarr; <strong>Publish to web</strong>.</li>
                  <li>Select the responses tab (usually <em>"Form Responses 1"</em>) and choose <strong>Comma-separated values (.csv)</strong>.</li>
                  <li>Click <strong>Publish</strong> and copy the generated URL.</li>
                </ol>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Published CSV URL:</label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Run Sync
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Application File</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-650">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedApp.userName}</h2>
                <p className="text-slate-405 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" /> {selectedApp.userEmail}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Job:</span>
                  <span className="font-semibold text-slate-800">{selectedApp.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Company:</span>
                  <span className="font-semibold text-blue-600">{selectedApp.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Applied Date:</span>
                  <span className="font-semibold text-slate-800">{selectedApp.appliedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Resume File:</span>
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                  >
                    <Download className="h-3.5 w-3.5" /> download_resume.pdf
                  </a>
                </div>
              </div>

              {/* Additional Candidate Details */}
              {(selectedApp.phone || selectedApp.education || selectedApp.portfolioUrl || selectedApp.skills) && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50/25 p-3 rounded-lg border border-blue-100/35 text-xs">
                  {selectedApp.phone && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Phone Number:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.phone}</span>
                    </div>
                  )}
                  {selectedApp.portfolioUrl && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Portfolio / LinkedIn:</span>
                      <a
                        href={selectedApp.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-650 hover:underline block truncate"
                      >
                        {selectedApp.portfolioUrl.replace(/https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                  {selectedApp.education && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">Education:</span>
                      <span className="font-semibold text-slate-800">{selectedApp.education}</span>
                    </div>
                  )}
                  {selectedApp.skills && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApp.skills.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-850 mb-1">Candidate Cover Letter</h4>
                <p className="leading-relaxed text-slate-600 bg-slate-50/35 border border-slate-150 p-3 rounded-lg">
                  {selectedApp.coverLetter || "No cover letter provided by candidate."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-850 mb-2">Advance Pipeline Stage</h4>
                <div className="flex flex-wrap gap-2">
                  {(['applied', 'reviewed', 'interview', 'hired', 'rejected'] as const).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedApp.id, stage)}
                      className={`rounded-lg px-2.5 py-1.5 font-semibold border text-[10px] capitalize transition-all ${
                        selectedApp.status === stage
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteApp(selectedApp.id)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-550"
              >
                Delete Record
              </button>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-650 hover:bg-slate-50"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
