import React from "react";
import {
  Brain,
  FileCheck,
  Sparkles,
  Terminal,
  Shield,
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "./api";

export default function Feature() {
  const loggedIn = isAuthenticated();

  const featuresList = [
    {
      icon: <Brain className="w-6 h-6 text-emerald-600" />,
      title: "Deep AI Parsing Engine",
      description:
        "Our advanced algorithm extracts contact info, work history, skills, and education structures with high fidelity.",
    },
    {
      icon: <FileCheck className="w-6 h-6 text-blue-600" />,
      title: "ATS Compatibility Scan",
      description:
        "Verify compliance with major ATS filters like Workday, Greenhouse, and Lever. Get a real-time parser readiness rating.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-600" />,
      title: "AI Bullet Point Enhancer",
      description:
        "Automatically substitute generic experience sentences with strong, metric-driven impact descriptions using Google's XYZ formula.",
    },
    {
      icon: <Target className="w-6 h-6 text-indigo-600" />,
      title: "Job Description Matcher",
      description:
        "Compare your resume side-by-side against any target job posting. Instantly highlight matched and missing keywords.",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Categorized Skill Gap Analysis",
      description:
        "Group identified skills by Languages, Frameworks, Cloud, and Methodologies to pinpoint exactly where you need to upskill.",
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      title: "Offline Resilient Analyzer",
      description:
        "Built-in neural and heuristic fallback ensures zero downtime, guaranteeing instant, reliable feedback every single time.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20">
            Intelligent Career Tools
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Tools Engineered to Beat the Algorithm
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Everything you need to optimize your resume, detect skill gaps, and land interviews at top tech companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuresList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to={loggedIn ? "/dashboard" : "/Register"}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
          >
            <span>{loggedIn ? "Go to Dashboard" : "Start Scanning For Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}