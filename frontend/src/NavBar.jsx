import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, LayoutDashboard, Menu, X, LogOut, Sparkles } from "lucide-react";
import { isAuthenticated, getCurrentUser, logout } from "./api";

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loggedIn = isAuthenticated();
  const user = getCurrentUser();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link className="flex items-center gap-2.5 hover:opacity-95 transition-opacity" to="/">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">ResumeAI</span>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Pro</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors" to="/">
            Home
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors" to="/Feature">
            Features
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1" to="/demo">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Live Demo
          </Link>
          {loggedIn && (
            <Link className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5" to="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span>{user?.name || "Dashboard"}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                className="text-sm font-semibold text-slate-600 hover:text-emerald-600 px-3 py-2 transition-colors"
                to="/Login"
              >
                Sign In
              </Link>
              <Link
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                to="/Register"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <Link
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1"
            to="/"
          >
            Home
          </Link>
          <Link
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1"
            to="/Feature"
          >
            Features
          </Link>
          <Link
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1"
            to="/demo"
          >
            Live Demo
          </Link>
          {loggedIn ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-bold text-emerald-600 py-1"
                to="/dashboard"
              >
                Go to Dashboard →
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="block text-sm font-semibold text-rose-600 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-semibold text-slate-700 py-2 rounded-xl bg-slate-100"
                to="/Login"
              >
                Sign In
              </Link>
              <Link
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-semibold text-white py-2 rounded-xl bg-emerald-600"
                to="/Register"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}