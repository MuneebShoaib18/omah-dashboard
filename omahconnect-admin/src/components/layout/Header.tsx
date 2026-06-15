import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Calendar,
  X,
  BookOpen,
  Shield,
  Sparkles,
  Info
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchCurrentUser, type User } from "../../services/api";

export function Header({ title = "OMAHCONNECT Admin Dashboard" }: { title?: string }) {
  const [user, setUser] = useState<User | null>(null);

  // Overlays State
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("May 12 – Jun 11, 2025");

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: "🚨 New Flag: Bruce Wayne reported a job post as Scam.", time: "2 min ago", unread: true },
    { id: 2, text: "📢 Outbox Success: Platform Maintenance Alert dispatched.", time: "1 hour ago", unread: true },
    { id: 3, text: "🏢 Verification Queue: TechCorp submitted documentation.", time: "3 hours ago", unread: true },
    { id: 4, text: "⚠️ AI Warning: Automated block triggered for ID usr-89.", time: "5 hours ago", unread: true },
    { id: 5, text: "📝 Job Post Audit: 4 new internship positions pending review.", time: "1 day ago", unread: false },
  ]);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const helpRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  return (
    <header className="mb-6 relative">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">
          {title}
        </h1>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search users, companies, jobs..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notifications Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowHelpMenu(false);
                setShowDateMenu(false);
              }}
              className={`relative rounded-lg p-2 transition-all ${
                showNotifMenu ? "bg-slate-100 text-blue-600" : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-150 rounded-xl shadow-xl z-50 p-4 space-y-3 text-xs text-slate-700 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">Alerts Dispatch History</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-550 transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        n.unread
                          ? "bg-blue-50/20 border-blue-100 font-semibold"
                          : "bg-slate-50/30 border-slate-100 text-slate-500"
                      }`}
                    >
                      <p className="line-clamp-2">{n.text}</p>
                      <span className="block text-[9px] text-slate-400 mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Trigger */}
          <div className="relative" ref={helpRef}>
            <button
              type="button"
              onClick={() => {
                setShowHelpMenu(!showHelpMenu);
                setShowNotifMenu(false);
                setShowDateMenu(false);
              }}
              className={`rounded-lg p-2 transition-all ${
                showHelpMenu ? "bg-slate-100 text-blue-600" : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Help Overlay Panel */}
            {showHelpMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 text-white border border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide text-blue-400">
                    <BookOpen className="h-4 w-4" />
                    <span>Quick Operations Guide</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHelpMenu(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="space-y-3 text-[11px] leading-relaxed text-slate-350">
                  <div className="flex gap-2">
                    <Shield className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
                    <p>
                      <strong>Verifications:</strong> Go to the <em>Companies</em> tab to approve business documents in the Verification Queue.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <p>
                      <strong>AI Moderation:</strong> Under <em>Communications</em>, view DMs containing auto-flags for crypto/spam topics.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <p>
                      <strong>Developer Tools:</strong> Monitor system CPU/Memory loads, or test queries inside the sandbox executor.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 select-none">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500">{user?.role || "Super Admin"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Date Picker Button Trigger */}
      <div className="mt-3 flex justify-end" ref={dateRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowDateMenu(!showDateMenu);
              setShowNotifMenu(false);
              setShowHelpMenu(false);
            }}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all ${
              showDateMenu
                ? "bg-slate-100 border-blue-300 text-blue-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Date Picker Dropdown list */}
          {showDateMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs text-slate-700 animate-fade-in">
              {[
                "May 12 – Jun 11, 2025",
                "Last 7 Days",
                "Last 30 Days",
                "This Month",
                "All Time"
              ].map((range) => (
                <div
                  key={range}
                  onClick={() => {
                    setSelectedDateRange(range);
                    setShowDateMenu(false);
                  }}
                  className={`px-4 py-2 hover:bg-slate-50 cursor-pointer font-medium transition ${
                    selectedDateRange === range ? "text-blue-600 bg-blue-50/20 font-bold" : ""
                  }`}
                >
                  {range}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
