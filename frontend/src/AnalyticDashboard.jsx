import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import Profile from "./Profile";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisReport from "./components/AnalysisReport";
import ATSMatchSection from "./components/ATSMatchSection";
import BulletPointEnhancer from "./components/BulletPointEnhancer";
import HistorySection from "./components/HistorySection";
import Toast from "./components/Toast";
import {
  apiFetch,
  API_BASE_URL,
  uploadResumeFile,
  analyzeResumeId,
  fetchScanHistory,
  deleteResumeId,
  fetchAtsHistory,
  getCurrentUser,
} from "./api";

export default function AnalyticDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [recentScans, setRecentScans] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [atsHistory, setAtsHistory] = useState([]);
  const [atsHistoryLoading, setAtsHistoryLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const [selectedResume, setSelectedResume] = useState(null);
  const [analysisReport, setAnalysisReport] = useState({
    score: 85,
    skills: ["Python", "Django", "React", "PostgreSQL", "Docker", "Git", "REST API"],
    missingKeywords: ["CI/CD", "AWS", "Kubernetes", "Redis"],
    strengths: [
      "Demonstrated experience building end-to-end full stack web applications.",
      "Clear articulation of technical stacks and core libraries.",
      "Consistent use of standard ATS recognized section headings."
    ],
    suggestions: [
      "Add quantifiable metric metrics to project bullet points (e.g., % improvement, user volume).",
      "Incorporate cloud deployment keywords such as AWS or Docker containerization.",
      "Include a 2-sentence Professional Summary tailored to target job titles."
    ],
    score_breakdown: {
      keywords: 85,
      impact: 75,
      formatting: 90,
      relevance: 85
    }
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch History
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetchScanHistory();
      const data = await response.json();

      if (response.ok && Array.isArray(data.history)) {
        const formatted = data.history.map((item) => ({
          id: item.resume_id,
          name: item.file_name,
          date: item.uploaded_at ? new Date(item.uploaded_at).toISOString().split("T")[0] : "-",
          score: Number(item.ats_score) || 0,
          skills: Array.isArray(item.skills) ? item.skills : [],
          missingKeywords: Array.isArray(item.missing_keywords) ? item.missing_keywords : [],
          strengths: Array.isArray(item.strengths) ? item.strengths : [],
          suggestions: Array.isArray(item.suggestions) ? item.suggestions : [],
          score_breakdown: item.score_breakdown || null,
          categorized_skills: item.categorized_skills || null,
        }));
        setRecentScans(formatted);
        if (formatted.length > 0 && !selectedResume) {
          setSelectedResume(formatted[0]);
          setAnalysisReport({
            score: formatted[0].score,
            skills: formatted[0].skills,
            missingKeywords: formatted[0].missingKeywords,
            strengths: formatted[0].strengths,
            suggestions: formatted[0].suggestions,
            score_breakdown: formatted[0].score_breakdown,
            categorized_skills: formatted[0].categorized_skills,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch ATS Matches History
  const loadAtsHistory = async () => {
    try {
      setAtsHistoryLoading(true);
      const response = await fetchAtsHistory();
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setAtsHistory(data);
      }
    } catch (err) {
      console.error("Failed to load ATS history:", err);
    } finally {
      setAtsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    loadAtsHistory();
  }, []);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf" && !uploadedFile.name.endsWith(".pdf")) {
      showToast("Please upload a valid PDF document.", "error");
      return;
    }

    if (uploadedFile.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit.", "error");
      return;
    }

    setIsScanning(true);
    setScanProgress(20);

    try {
      // Step 1: Upload
      const uploadResp = await uploadResumeFile(uploadedFile);
      const uploadData = await uploadResp.json();

      if (!uploadResp.ok) {
        throw new Error(uploadData.error || uploadData.detail || "Resume upload failed.");
      }

      const resumeId = uploadData?.resume?.id;
      if (!resumeId) {
        throw new Error("Resume ID not returned from upload.");
      }

      setScanProgress(55);

      // Step 2: Analyze
      const analyzeResp = await analyzeResumeId(resumeId);
      const analyzeData = await analyzeResp.json();

      if (!analyzeResp.ok) {
        throw new Error(analyzeData.error || analyzeData.detail || "Resume analysis failed.");
      }

      setScanProgress(90);

      const analysis = analyzeData?.analysis || {};
      const newScanItem = {
        id: resumeId,
        name: uploadedFile.name,
        date: new Date().toISOString().split("T")[0],
        score: Number(analysis.ats_score) || 0,
        skills: Array.isArray(analysis.skills) ? analysis.skills : [],
        missingKeywords: Array.isArray(analysis.missing_keywords) ? analysis.missing_keywords : [],
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
        score_breakdown: analysis.score_breakdown || null,
        categorized_skills: analysis.categorized_skills || null,
      };

      setSelectedResume(newScanItem);
      setAnalysisReport({
        score: newScanItem.score,
        skills: newScanItem.skills,
        missingKeywords: newScanItem.missingKeywords,
        strengths: newScanItem.strengths,
        suggestions: newScanItem.suggestions,
        score_breakdown: newScanItem.score_breakdown,
        categorized_skills: newScanItem.categorized_skills,
      });

      setRecentScans((prev) => [newScanItem, ...prev.filter((p) => p.id !== resumeId)]);
      setScanProgress(100);

      showToast("Resume successfully analyzed with AI!", "success");

      setTimeout(() => {
        setIsScanning(false);
        setActiveTab("analysis");
      }, 600);
    } catch (err) {
      console.error("Scan error:", err);
      setIsScanning(false);
      setScanProgress(0);
      showToast(err.message || "Failed to process resume.", "error");
    }
  };

  const handleSelectScan = (scan) => {
    setSelectedResume(scan);
    setAnalysisReport({
      score: scan.score,
      skills: scan.skills,
      missingKeywords: scan.missingKeywords,
      strengths: scan.strengths,
      suggestions: scan.suggestions,
      score_breakdown: scan.score_breakdown,
      categorized_skills: scan.categorized_skills,
    });
    setActiveTab("analysis");
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume and its associated match reports?")) {
      return;
    }

    try {
      const resp = await deleteResumeId(resumeId);
      if (!resp.ok) {
        throw new Error("Failed to delete resume.");
      }

      setRecentScans((prev) => prev.filter((item) => item.id !== resumeId));
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
      }
      loadAtsHistory();
      showToast("Resume removed successfully.", "info");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete resume.", "error");
    }
  };

  const handleLoadSampleResume = () => {
    const sample = {
      id: 999999,
      name: "Sample_Software_Engineer_Resume.pdf",
      date: new Date().toISOString().split("T")[0],
      score: 86,
      skills: [
        "Python", "JavaScript", "TypeScript", "React", "Django", "Django REST Framework",
        "PostgreSQL", "Docker", "Git", "REST API", "Tailwind CSS", "Redis"
      ],
      missingKeywords: ["CI/CD", "AWS", "Kubernetes", "Unit Testing", "Microservices"],
      strengths: [
        "Strong core web development stack with full-stack proficiency (React + Django).",
        "Clear quantifiable achievements in database optimization and query caching.",
        "Demonstrated familiarity with containerization and version control practices.",
        "Structured section headers compliant with ATS machine parsing standards."
      ],
      suggestions: [
        "Add measurable metrics such as percentage performance boosts or request volume handled.",
        "Highlight cloud experience (AWS EC2, S3, or Lambda) if applicable.",
        "Include a concise 2-sentence Professional Summary highlighting years of experience.",
        "Mirror keyword phrasing from specific target job descriptions."
      ],
      score_breakdown: {
        keywords: 88,
        impact: 82,
        formatting: 92,
        relevance: 85
      },
      categorized_skills: {
        Languages: ["Python", "JavaScript", "TypeScript"],
        Frameworks: ["React", "Django", "Django REST Framework", "Tailwind CSS"],
        "Cloud & Tools": ["Docker", "PostgreSQL", "Redis", "Git"],
        Concepts: ["REST API"]
      }
    };

    setSelectedResume(sample);
    setAnalysisReport({
      score: sample.score,
      skills: sample.skills,
      missingKeywords: sample.missingKeywords,
      strengths: sample.strengths,
      suggestions: sample.suggestions,
      score_breakdown: sample.score_breakdown,
      categorized_skills: sample.categorized_skills,
    });

    setRecentScans((prev) => [sample, ...prev.filter((p) => p.id !== sample.id)]);
    showToast("Loaded sample Software Engineer profile!", "info");
    setActiveTab("analysis");
  };

  const user = getCurrentUser();

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Toast Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* Modern Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        scanCount={recentScans.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="capitalize">{activeTab.replace("-", " ")}</span>
              {selectedResume && activeTab === "analysis" && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-800 truncate max-w-xs">{selectedResume.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSampleResume}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Demo Sample
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden md:inline">
                {user?.name || "My Account"}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === "dashboard" && (
            <DashboardOverview
              scans={recentScans}
              atsMatches={atsHistory}
              onNavigateTab={setActiveTab}
              onSelectScan={handleSelectScan}
              onLoadSampleResume={handleLoadSampleResume}
            />
          )}

          {activeTab === "upload" && (
            <ResumeUpload
              onFileUpload={handleFileUpload}
              isScanning={isScanning}
              scanProgress={scanProgress}
              onLoadSampleResume={handleLoadSampleResume}
            />
          )}

          {activeTab === "analysis" && (
            <AnalysisReport
              report={analysisReport}
              resumeName={selectedResume?.name}
              resumeDate={selectedResume?.date}
              onScanAnother={() => setActiveTab("upload")}
              onMatchJob={() => setActiveTab("ats-match")}
              onShowToast={showToast}
            />
          )}

          {activeTab === "ats-match" && (
            <ATSMatchSection
              resumes={recentScans}
              selectedResume={selectedResume}
              setSelectedResume={setSelectedResume}
              onShowToast={showToast}
              onMatchSuccess={() => loadAtsHistory()}
            />
          )}

          {activeTab === "bullet-enhancer" && (
            <BulletPointEnhancer onShowToast={showToast} selectedResume={selectedResume} />
          )}

          {activeTab === "history" && (
            <HistorySection
              scans={recentScans}
              atsMatches={atsHistory}
              onSelectScan={handleSelectScan}
              onDeleteScan={handleDeleteResume}
              loading={historyLoading || atsHistoryLoading}
            />
          )}

          {activeTab === "profile" && <Profile onShowToast={showToast} />}
        </main>
      </div>
    </div>
  );
}
