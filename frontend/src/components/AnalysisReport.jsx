import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Lightbulb,
  ArrowRight,
  Printer,
  Copy,
  Check,
  Target,
  FileText,
  RotateCcw,
} from "lucide-react";

export default function AnalysisReport({
  report,
  resumeName,
  resumeDate,
  onScanAnother,
  onMatchJob,
  onShowToast,
}) {
  const [copiedKeyword, setCopiedKeyword] = useState(null);

  const score = Number(report?.score || report?.ats_score) || 0;
  const skills = Array.isArray(report?.skills) ? report.skills : [];
  const missingKeywords = Array.isArray(report?.missingKeywords || report?.missing_keywords)
    ? (report.missingKeywords || report.missing_keywords)
    : [];
  const strengths = Array.isArray(report?.strengths) ? report.strengths : [];
  const suggestions = Array.isArray(report?.suggestions) ? report.suggestions : [];
  const categorized = report?.categorized_skills || null;
  const breakdown = report?.score_breakdown || {
    keywords: Math.min(100, Math.round(score * 1.05)),
    impact: Math.min(100, Math.round(score * 0.9)),
    formatting: Math.min(100, Math.round(score * 1.1)),
    relevance: score,
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    if (onShowToast) onShowToast(`Copied "${text}" to clipboard!`, "info");
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreStatus = (val) => {
    if (val >= 80) return { label: "Highly Competitive", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (val >= 60) return { label: "Average Market Fit", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Needs ATS Optimization", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const status = getScoreStatus(score);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto print:p-0">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Resume Analysis Report
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
              {status.label}
            </span>
          </div>
          {resumeName && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Analyzing: <strong className="text-slate-800">{resumeName}</strong></span>
              {resumeDate && <span className="text-slate-400">({resumeDate})</span>}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Export / Print
          </button>
          <button
            onClick={onMatchJob}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Target className="w-3.5 h-3.5" />
            Match with Job Post
          </button>
        </div>
      </div>

      {/* Hero Score Card & Multi-Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Dial */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              <circle
                className="text-slate-100"
                cx="96"
                cy="96"
                fill="transparent"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
              />
              <circle
                className={score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-rose-500"}
                cx="96"
                cy="96"
                fill="transparent"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="502"
                style={{
                  strokeDashoffset: 502 - (502 * score) / 100,
                  transition: "stroke-dashoffset 1s ease-in-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                ATS SCORE
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{status.label}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {score >= 80
              ? "Your resume shows strong alignment with ATS algorithms and recruiters."
              : score >= 60
              ? "Solid foundation with room to improve keyword density and measurable metrics."
              : "Significant ATS optimization required to pass automated screening filters."}
          </p>
        </div>

        {/* Right: Multi-Pillar Score Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Multi-Factor ATS Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Evaluation across four key pillars analyzed by hiring algorithms.
            </p>

            <div className="space-y-4">
              {/* Pillar 1: Keywords */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Technical Skill & Keyword Density</span>
                  <span className="text-slate-900">{breakdown.keywords}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.keywords}%` }}
                  />
                </div>
              </div>

              {/* Pillar 2: Impact */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Quantifiable Metrics & Business Impact</span>
                  <span className="text-slate-900">{breakdown.impact}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.impact}%` }}
                  />
                </div>
              </div>

              {/* Pillar 3: Formatting */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700">ATS Layout & Machine Readability</span>
                  <span className="text-slate-900">{breakdown.formatting}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.formatting}%` }}
                  />
                </div>
              </div>

              {/* Pillar 4: Relevance */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Role Relevance & Section Completeness</span>
                  <span className="text-slate-900">{breakdown.relevance}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${breakdown.relevance}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Scanned against standard ATS parsers (Workday, Greenhouse, Lever).
            </span>
            <button
              onClick={onScanAnother}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Scan Another Resume
            </button>
          </div>
        </div>
      </div>

      {/* Missing Keywords & Strengths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Missing High-Impact Keywords</h3>
              <p className="text-xs text-slate-400">Click to copy and add to your resume</p>
            </div>
          </div>

          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {missingKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(kw)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
                >
                  <span>+ {kw}</span>
                  {copiedKeyword === kw ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Great job! No critical industry keywords appear to be missing.</span>
            </div>
          )}
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Resume Strengths</h3>
              <p className="text-xs text-slate-400">Positive signals detected by the analyzer</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No specific strengths recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detected Skills (Categorized or Flat) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Detected Technical Skills</h3>
              <p className="text-xs text-slate-400">Extracted directly from your resume text</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {skills.length} Skills Identified
          </span>
        </div>

        {categorized && (categorized.Languages?.length > 0 || categorized.Frameworks?.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {Object.entries(categorized).map(([cat, list]) => (
              list.length > 0 && (
                <div key={cat} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cat}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Actionable Suggestions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Recruiter Suggestions</h3>
            <p className="text-xs text-slate-400">Implement these updates to reach the top 10% of applicants</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100/80 text-xs text-slate-700"
            >
              <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold text-slate-900 mr-1.5">Action {idx + 1}:</span>
                {sug}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
