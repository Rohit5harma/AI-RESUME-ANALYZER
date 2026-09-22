import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crosshair,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { fetchScanHistory, saveJobDescription, performAtsMatch } from "./api";

export default function ATSAnalysis() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetchScanHistory();
        if (!response.ok) {
          throw new Error("Failed to fetch uploaded resumes.");
        }
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.history)
            ? data.history
            : [];
        setResumes(list);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchResumes();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!selectedResume) {
      setError("Please select a resume.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter the target job title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter the job description.");
      return;
    }

    setLoading(true);

    try {
      const jdResponse = await saveJobDescription(jobTitle, company, description);
      const jdData = await jdResponse.json();

      if (!jdResponse.ok) {
        throw new Error(
          jdData.detail || jdData.error || "Failed to save job description."
        );
      }

      const atsResponse = await performAtsMatch(selectedResume, jdData.id);
      const atsData = await atsResponse.json();

      if (!atsResponse.ok) {
        throw new Error(atsData.detail || atsData.error || "ATS analysis failed.");
      }

      setResult(atsData.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <Crosshair className="w-3.5 h-3.5" />
            Targeted Match
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            ATS Resume Match Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare your resume directly against any company's job description.
          </p>
        </div>

        <form
          onSubmit={handleAnalyze}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Resume
            </label>
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            >
              <option value="">-- Choose your uploaded resume --</option>
              {resumes.map((resume) => (
                <option
                  key={resume.resume_id || resume.id}
                  value={resume.resume_id || resume.id}
                >
                  {resume.file_name} {resume.ats_score ? `(Score: ${resume.ats_score})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Stripe, Google, Airbnb"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Job Description
            </label>
            <textarea
              rows={8}
              placeholder="Paste the employer's job description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-y"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 py-3.5 px-6 text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Comparing with Job Requirements...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>Calculate Match Score</span>
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Target Match Result
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {jobTitle} {company ? `@ ${company}` : ""}
                </h2>
              </div>

              <div className="w-24 h-24 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center font-black text-emerald-700">
                <span className="text-3xl">{result.ats_score}%</span>
                <span className="text-[9px] uppercase tracking-widest text-emerald-600">
                  Match
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Keywords ({result.matched_keywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(result.matched_keywords || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3">
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Missing Keywords ({result.missing_keywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(result.missing_keywords || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-semibold"
                    >
                      ✕ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Tailored Recommendations
              </h3>
              <div className="space-y-2">
                {(result.recommendations || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}