import React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  Crosshair,
  Sparkles,
  History,
  UserCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser, logout } from "../api";

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, scanCount = 0 }) {
  const user = getCurrentUser();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "upload",
      label: "Upload & Scan",
      icon: UploadCloud,
      badge: "Fast",
    },
    {
      id: "analysis",
      label: "Resume Insights",
      icon: FileSearch,
      badge: null,
    },
    {
      id: "ats-match",
      label: "Job ATS Match",
      icon: Crosshair,
      badge: "Targeted",
    },
    {
      id: "bullet-enhancer",
      label: "Bullet Enhancer",
      icon: Sparkles,
      badge: "AI New",
    },
    {
      id: "history",
      label: "Scan History",
      icon: History,
      badge: scanCount > 0 ? `${scanCount}` : null,
    },
    {
      id: "profile",
      label: "Career Profile",
      icon: UserCircle,
      badge: null,
    },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-slate-900 text-slate-200 p-4 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
            R
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">ResumeAI</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Gemini & ATS Engine
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Main Features
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badge === "AI New"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 font-extrabold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section & Pro Badge */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Session" />
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen shrink-0 sticky top-0 z-30 shadow-xl">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 h-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
