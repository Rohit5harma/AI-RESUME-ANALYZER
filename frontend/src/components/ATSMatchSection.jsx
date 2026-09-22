import React, { useState } from "react";
import {
  Crosshair,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Briefcase,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Play,
} from "lucide-react";
import { saveJobDescription, performAtsMatch } from "../api";

export default function ATSMatchSection({
  resumes = [],
  selectedResume,
  setSelectedResume,
  onShowToast,
  onMatchSuccess,
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleJDs = [
    {
      title: "Senior Full Stack Engineer",
      company: "InnovateTech",
      desc: "We are seeking a Senior Full Stack Engineer experienced with Python, Django, React, and TypeScript. You will build RESTful microservices, containerize applications with Docker, deploy on AWS, and write automated unit tests. Experience with PostgreSQL, Redis, and CI/CD pipelines is required.",
    },
    {
      title: "Backend Django Developer",
      company: "CloudScale Systems",
      desc: "Looking for an experienced Backend Developer specializing in Python, Django REST Framework, and SQL. Responsibilities include designing scalable database schemas, optimizing complex SQL queries in PostgreSQL, caching with Redis, and integrating third-party APIs.",
    },
    {
      title: "Frontend React Specialist",
      company: "Modern Web Labs",
      desc: "Join our frontend engineering team building high-performance web applications using React, Next.js, Tailwind CSS, and TypeScript. You should have strong experience with state management, responsive UI design, and web performance optimization.",
    },
  ];

  const handleFillSample = (sample) => {
    setJobTitle(sample.title);
    setCompany(sample.company);
    setDescription(sample.desc);
    if (onShowToast) onShowToast(`Loaded sample JD for "${sample.title}"`, "info");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedResume?.id) {
      if (onShowToast) onShowToast("Please select a resume first.", "warning");
      return;
    }

    if (!jobTitle.trim()) {
      if (onShowToast) onShowToast("Job title is required.", "warning");
      return;
    }

    if (!description.trim()) {
      if (onShowToast) onShowToast("Job description is required.", "warning");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Save Job Description
      const jdResponse = await saveJobDescription(jobTitle, company, description);
      const jdData = await jdResponse.json();

      if (!jdResponse.ok) {
        throw new Error(jdData.error || jdData.detail || "Failed to save job description.");
      }

      // 2. Run ATS Match
      const matchResponse = await performAtsMatch(selectedResume.id, jdData.id);
      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(matchData.error || matchData.detail || "ATS match analysis failed.");
      }

      setResult(matchData.analysis);
      if (onShowToast) onShowToast("ATS Match analysis completed!", "success");
      if (onMatchSuccess) onMatchSuccess(matchData.analysis);
    } catch (err) {
      console.error("ATS Match Error:", err);
      if (onShowToast) onShowToast(err.message || "Failed to run ATS match.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Crosshair className="w-3.5 h-3.5" />
          Targeted Job Match
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ATS Job Match Analysis
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Compare your resume against any target job posting to identify keyword gaps and increase your interview call rate.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleAnalyze} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Select Resume */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select Resume To Compare
          </label>
          {resumes.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
              <span>No uploaded resumes found. Please upload a resume first.</span>
            </div>
          ) : (
            <select
              value={selectedResume?.id || ""}
              onChange={(e) => {
                const found = resumes.find((r) => r.id === Number(e.target.value));
                setSelectedResume(found || null);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            >
              <option value="">-- Choose an uploaded resume --</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Score: {r.score})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Target Role & Job Posting
            </label>
            <span className="text-[11px] text-slate-400">Quick-load sample JD:</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {sampleJDs.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleFillSample(s)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                ⚡ {s.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Target Job Title (e.g. Senior Backend Engineer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Company Name (e.g. Google, Stripe, etc.)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <textarea
            rows={8}
            placeholder="Paste the full job description here (responsibilities, required qualifications, technical stack)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-y"
          />
        </div>

        {/* Analyze Button */}
        <button
          type="submit"
          disabled={loading || !selectedResume?.id}
          className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Matching Against Job Requirements...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span>Calculate ATS Job Match Score</span>
            </>
          )}
        </button>
      </form>

      {/* Match Result Display */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
          {/* Match Score Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                ATS Compatibility Result
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                Match for {jobTitle} {company ? `@ ${company}` : ""}
              </h2>
              <p className="text-xs text-slate-500">
                Based on required skills, keywords, and responsibilities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center text-emerald-700 font-black">
                <span className="text-3xl">{result.ats_score}%</span>
                <span className="text-[9px] uppercase tracking-widest text-emerald-600">Match</span>
              </div>
            </div>
          </div>

          {/* Keywords Match & Gap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Matched Job Keywords ({result.matched_keywords?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(result.matched_keywords || []).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Key Requirements ({result.missing_keywords?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(result.missing_keywords || []).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-semibold shadow-2xs"
                  >
                    ✕ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations for this JD */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tailored Optimization Steps for this Job
            </h3>
            <div className="space-y-2.5">
              {(result.recommendations || []).map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
