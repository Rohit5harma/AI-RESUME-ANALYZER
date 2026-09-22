import React from "react";
import {
  FileText,
  Target,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
} from "lucide-react";
import { getCurrentUser } from "../api";

export default function DashboardOverview({
  scans = [],
  atsMatches = [],
  onNavigateTab,
  onSelectScan,
  onLoadSampleResume,
}) {
  const user = getCurrentUser();

  // Statistics calculation
  const totalScans = scans.length;
  const avgScore = totalScans > 0
    ? Math.round(scans.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / totalScans)
    : 0;

  const totalSkillsDetected = scans.reduce(
    (acc, curr) => acc + (Array.isArray(curr.skills) ? curr.skills.length : 0),
    0
  );

  const highestScore = scans.length > 0
    ? Math.max(...scans.map(s => Number(s.score) || 0))
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Resume Intelligence Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Professional"}!
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Boost your resume visibility, beat applicant tracking systems, and match your skills to real-world job descriptions in seconds.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab("upload")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Upload & Scan Resume
            </button>
            <button
              onClick={() => onNavigateTab("ats-match")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              Job Description Match
            </button>
            {totalScans === 0 && (
              <button
                onClick={onLoadSampleResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-300" />
                Load Demo Resume
              </button>
            )}
          </div>
        </div>
        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Scanned */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resumes</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalScans}</div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {totalScans > 0 ? "Uploaded & Analyzed" : "Upload your first resume"}
          </p>
        </div>

        {/* Avg ATS Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg ATS Score</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgScore >= 80 ? "bg-emerald-500" : avgScore >= 60 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${Math.max(5, avgScore)}%` }}
            />
          </div>
        </div>

        {/* Top Match Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak Score</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {highestScore > 0 ? `${highestScore}%` : "-"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {highestScore >= 80 ? "Highly competitive score" : highestScore > 0 ? "Good baseline" : "Pending analysis"}
          </p>
        </div>

        {/* Total Job Matches */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Matches</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{atsMatches.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            {atsMatches.length > 0 ? "Targeted comparisons made" : "No job comparisons yet"}
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Resumes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any resume to open its full AI report</p>
            </div>
            <button
              onClick={() => onNavigateTab("history")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all ({scans.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {scans.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No resumes analyzed yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload your PDF resume or try our instant sample to see comprehensive ATS insights.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => onNavigateTab("upload")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  Upload Resume
                </button>
                <button
                  onClick={onLoadSampleResume}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Load Sample
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scans.slice(0, 4).map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate pr-4">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                        {scan.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Uploaded on {scan.date} • {scan.skills?.length || 0} skills detected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          scan.score >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : scan.score >= 60
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {scan.score} ATS
                      </span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Highlights & Quick Tools (1 col) */}
        <div className="space-y-4">
          {/* Bullet Enhancer Quick Card */}
          <div className="bg-gradient-to-br from-teal-900 to-emerald-900 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase">
                <Sparkles className="w-3 h-3" />
                AI Feature
              </div>
              <h3 className="text-base font-bold">Bullet Point Enhancer</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Transform weak bullet points into high-impact, quantifiable bullets using Google's XYZ formula.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("bullet-enhancer")}
              className="mt-4 w-full py-2.5 bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Open Enhancer Studio
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick ATS Tips Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Recruiter ATS Rules
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Include metric-driven impacts (e.g. % improvement, latency reduction).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mirror technical keyword phrasing directly from target job posts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep formatting standard without embedded tables or graphics in PDF.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
