import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Code2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function DemoAnalysis() {
  const navigate = useNavigate();

  const skills = ["Python", "JavaScript", "TypeScript", "React", "Django", "PostgreSQL", "Docker", "Git"];
  const missingKeywords = ["CI/CD Pipelines", "AWS Cloud", "Kubernetes", "Unit Testing", "Microservices"];

  const strengths = [
    "Comprehensive full-stack tech stack demonstrating frontend and backend expertise.",
    "Well-structured sections adhering to ATS machine-readability guidelines.",
    "Demonstrated experience with containerization and version control best practices.",
  ];

  const suggestions = [
    "Incorporate quantifiable business impact into project bullets (e.g. 'reduced latency by 35%').",
    "Add cloud infrastructure keywords (AWS, GCP, or Docker Swarm) to match high-demand postings.",
    "Include a tailored 2-line Professional Summary directly addressing target job requirements.",
  ];

  const score = 86;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm">
              R
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-base">ResumeAI</span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Demo Mode</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              Open Full Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Sample Report
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Software Engineer Resume Analysis
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            This is a preview of the in-depth insights and scoring delivered by the ResumeAI engine.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 flex items-center justify-center mb-3">
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
                    className="text-emerald-500"
                    cx="96"
                    cy="96"
                    fill="transparent"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray="502"
                    strokeDashoffset={502 - (502 * score) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900">{score}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    AI ATS SCORE
                  </span>
                </div>
              </div>

              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                Highly Competitive Fit
              </span>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Diagnostic Overview
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Strong technical foundation with high ATS readability
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  The candidate displays strong mastery of core web technologies and modern architectural patterns. Integrating quantified metrics and target keywords will elevate this profile into the top percentile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block">ATS Readability</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">94%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block">Keyword Match</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Detected Skills ({skills.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Recommended Additions ({missingKeywords.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((k) => (
                <span
                  key={k}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
                >
                  + {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Core Strengths
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              {strengths.map((str, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Suggestions
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              {suggestions.map((sug, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-8 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold">
            Ready to analyze your own resume?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Upload your PDF and get instant ATS evaluation and job comparison tailored to your target roles.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Launch Free Resume Scan →
          </button>
        </div>
      </main>
    </div>
  );
}