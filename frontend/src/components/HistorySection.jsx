import React, { useState } from "react";
import {
  History,
  FileText,
  Target,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  Award,
  AlertCircle,
} from "lucide-react";

export default function HistorySection({
  scans = [],
  atsMatches = [],
  onSelectScan,
  onDeleteScan,
  loading = false,
}) {
  const [activeSubTab, setActiveSubTab] = useState("resumes"); // 'resumes' | 'matches'
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResumes = scans.filter((s) =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatches = atsMatches.filter((m) =>
    (m.job_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.resume_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan & Match History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access previous AI evaluations and job match comparisons.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab("resumes")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === "resumes"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Resumes ({scans.length})
          </button>
          <button
            onClick={() => setActiveSubTab("matches")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === "matches"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Job Matches ({atsMatches.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={
            activeSubTab === "resumes"
              ? "Search resumes by filename..."
              : "Search job matches by title or company..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* Content */}
      {activeSubTab === "resumes" ? (
        /* Resumes List */
        <div className="space-y-3">
          {filteredResumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No resumes found</p>
              <p className="text-xs mt-1">Upload a resume to begin tracking history.</p>
            </div>
          ) : (
            filteredResumes.map((scan) => (
              <div
                key={scan.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {scan.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {scan.date}
                      </span>
                      <span>•</span>
                      <span>{scan.skills?.length || 0} skills detected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      scan.score >= 80
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : scan.score >= 60
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {scan.score} ATS
                  </span>

                  <button
                    onClick={() => onSelectScan(scan)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>View Insights</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteScan(scan.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete resume and analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ATS Job Matches List */
        <div className="space-y-3">
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Target className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No job matches found</p>
              <p className="text-xs mt-1">Run an ATS Job Match comparison to record history.</p>
            </div>
          ) : (
            filteredMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {match.job_title} {match.company ? `@ ${match.company}` : ""}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Matched against: <strong className="text-slate-700">{match.resume_name}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {match.ats_score}% Match
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-emerald-700 block mb-1">
                      Matched ({match.matched_keywords?.length || 0}):
                    </span>
                    <p className="text-slate-600 truncate">
                      {(match.matched_keywords || []).join(", ") || "None"}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-rose-700 block mb-1">
                      Missing ({match.missing_keywords?.length || 0}):
                    </span>
                    <p className="text-slate-600 truncate">
                      {(match.missing_keywords || []).join(", ") || "None"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
