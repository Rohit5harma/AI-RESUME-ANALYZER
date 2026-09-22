import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { isAuthenticated } from "./api";

export default function LandingPage() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  return (
    <div className="bg-slate-50 text-slate-900 font-sans overflow-x-hidden min-h-screen">
      <main className="pt-24">
        <section className="relative px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Next-Gen Gemini AI + Heuristic ATS Engine
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Get Your Resume Past The ATS and Into the{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Interview Pile.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Scan your resume in seconds. Our AI measures keyword density, identifies critical skill gaps, quantifies bullet-point impact, and compares your qualifications directly against target job descriptions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={loggedIn ? "/dashboard" : "/Register"}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{loggedIn ? "Go to My Dashboard" : "Scan Resume for Free"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => navigate("/demo")}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5 text-emerald-600" />
                  <span>See Interactive Demo</span>
                </button>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant ATS Score (0-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Missing Keyword Highlighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free to Start</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative max-w-md mx-auto w-full">
              <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <div className="relative w-44 h-44 flex items-center justify-center">
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
                        strokeDashoffset="75"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tight">88</span>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                        AI SCORE
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                    Highly Competitive Match
                  </div>
                </div>

                <div className="space-y-2.5 mt-2 border-t border-slate-100 pt-5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="text-emerald-600 w-4 h-4" />
                      <span className="font-semibold text-slate-700">Cloud & Docker Keywords</span>
                    </div>
                    <span className="text-emerald-600 font-bold">+14 pts</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="text-rose-500 w-4 h-4" />
                      <span className="font-semibold text-slate-700">Missing Quantifiable Metrics</span>
                    </div>
                    <span className="text-rose-600 font-bold">-6 pts</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Zap className="text-amber-500 w-4 h-4" />
                      <span className="font-semibold text-slate-700">ATS Layout Compliance</span>
                    </div>
                    <span className="text-slate-900 font-bold">98% Clean</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -top-4 -right-4 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl items-center gap-3 border border-slate-800 animate-bounce" style={{ animationDuration: "4s" }}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold">ATS Optimized</p>
                  <p className="text-[10px] text-slate-400">Greenhouse & Workday Ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-slate-200/80 py-10 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900">75%</div>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                Of resumes are filtered out automatically before ever reaching human eyes.
              </p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">3.4x</div>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                Higher interview invitation rate when tailoring keywords to the job post.
              </p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900">10 Sec</div>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                Average time a recruiter spends glancing at a candidate's resume summary.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How ResumeAI Accelerates Your Career
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Upload PDF Resume</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Drop your existing PDF into our parser. We extract skills, experience, and format hierarchy instantly.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Get Multi-Factor Score</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Receive an objective score breakdown across technical skills, action verbs, formatting, and missing keywords.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Tailor & Apply</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Paste any job description to calculate exact alignment and rewrite bullet points with AI precision.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Stand Out to Top Tech Recruiters?
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Join thousands of candidates who optimized their resumes with our AI engine.
              </p>
              <div className="pt-2">
                <Link
                  to={loggedIn ? "/dashboard" : "/Register"}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg transition-all active:scale-95"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
              R
            </div>
            <span className="font-bold text-slate-800 text-sm">ResumeAI Pro</span>
          </div>
          <p>© {new Date().getFullYear()} ResumeAI Analysis Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}