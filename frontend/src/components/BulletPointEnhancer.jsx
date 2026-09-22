import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Award,
  Zap,
  FileText,
  Target,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  fetchBulletEnhancerResumes,
  enhanceBulletPointApi,
  saveBulletEnhancementApi,
  previewBulletReanalysisApi,
} from "../api";

export default function BulletPointEnhancer({ onShowToast, selectedResume: dashboardResume }) {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState(dashboardResume?.id || "");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [selectedBullet, setSelectedBullet] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingIndex, setSavingIndex] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingResumes(true);
        const response = await fetchBulletEnhancerResumes();
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load resumes.");
        const list = Array.isArray(data.resumes) ? data.resumes : [];
        setResumes(list);
        const dashboardMatch = dashboardResume?.id
          ? list.find((item) => String(item.id) === String(dashboardResume.id))
          : null;
        const initialId = dashboardMatch?.id || list[0]?.id || "";
        setResumeId(initialId);
      } catch (err) {
        console.error("Bullet enhancer resume load error:", err);
        onShowToast?.(err.message || "Unable to load resumes.", "error");
      } finally {
        setLoadingResumes(false);
      }
    };
    load();
  }, [dashboardResume?.id]);

  const selectedResumeData = useMemo(
    () => resumes.find((item) => String(item.id) === String(resumeId)) || null,
    [resumes, resumeId]
  );

  useEffect(() => {
    if (!selectedResumeData) return;
    const preferredRole = selectedResumeData?.analysis?.target_role;
    if (preferredRole) setTargetRole(preferredRole);
    if (!selectedBullet && selectedResumeData.bullets?.length) {
      setSelectedBullet(selectedResumeData.bullets[0]);
    }
    setResult(null);
  }, [selectedResumeData?.id]);

  const analysis = selectedResumeData?.analysis || {};
  const breakdown = analysis.score_breakdown || {};

  const bulletGuidance = useMemo(() => {
    if (!selectedBullet.trim()) {
      return analysis.suggestions?.slice(0, 3) || [];
    }

    const guidance = [];
    const hasMetric = /\b\d+(?:\.\d+)?%?\b|\$\d+/i.test(selectedBullet);
    const weakStart = /^(worked on|helped with|responsible for|did|involved in|participated in|assisted with)\b/i.test(selectedBullet.trim());

    if (!hasMetric) {
      guidance.push("No measurable result is present in this bullet. Add a real metric only if you can verify it.");
    }
    if (weakStart) {
      guidance.push("Consider replacing the weak opening phrase with a stronger action verb that accurately describes your contribution.");
    }
    if (selectedBullet.trim().length < 80) {
      guidance.push("Add the specific technical contribution or outcome when it is supported by your actual work.");
    }
    if (!guidance.length) {
      guidance.push("Keep the bullet specific, role-relevant, and factually grounded in your actual contribution.");
    }

    return guidance.slice(0, 3);
  }, [selectedBullet, analysis.suggestions]);

  const handleEnhance = async () => {
    if (!resumeId) {
      onShowToast?.("Select an analyzed resume first.", "warning");
      return;
    }
    if (!selectedBullet.trim()) {
      onShowToast?.("Select a resume bullet to enhance.", "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await enhanceBulletPointApi(resumeId, selectedBullet, targetRole);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to enhance bullet point.");
      setResult(data);
      onShowToast?.("Bullet enhanced using your ATS analysis context.", "success");
    } catch (err) {
      console.error("Enhancer error:", err);
      onShowToast?.(err.message || "Enhancement failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onShowToast?.("Bullet point copied to clipboard!", "info");
    setTimeout(() => setCopiedIndex(null), 2000);
  };


  const handlePreview = async (item, index) => {
    setPreviewIndex(index);
    setPreview(null);
    try {
      const response = await previewBulletReanalysisApi({
        resume_id: resumeId,
        original_bullet: selectedBullet,
        enhanced_bullet: item.text,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not calculate ATS preview.");
      setPreview(data);
      onShowToast?.("ATS preview calculated without changing your original resume.", "success");
    } catch (err) {
      onShowToast?.(err.message || "Could not calculate ATS preview.", "error");
    } finally {
      setPreviewIndex(null);
    }
  };

  const handleSave = async (item, index) => {
    setSavingIndex(index);
    try {
      const response = await saveBulletEnhancementApi({
        resume_id: resumeId,
        original_bullet: selectedBullet,
        enhanced_bullet: item.text,
        style: item.style,
        target_role: targetRole,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save enhancement.");
      onShowToast?.("Enhancement saved to your Bullet Enhancer history.", "success");
    } catch (err) {
      onShowToast?.(err.message || "Could not save enhancement.", "error");
    } finally {
      setSavingIndex(null);
    }
  };

  const renderScore = (label, value) => (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{value == null ? "—" : `${value}%`}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          ATS-Connected AI Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Resume Bullet Enhancer</h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          Select a bullet from an analyzed resume and improve it using the resume's actual ATS feedback. The AI will not invent metrics or achievements.
        </p>
      </div>

      {loadingResumes ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading your analyzed resumes...
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-amber-200 p-8 text-center">
          <FileText className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900">No analyzed resume found</h2>
          <p className="text-sm text-slate-500 mt-1">Upload and analyze a resume first, then return here to improve its bullets.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Analyzed Resume</label>
              <select
                value={resumeId}
                onChange={(e) => {
                  setResumeId(e.target.value);
                  setSelectedBullet("");
                  setResult(null);
                  setPreview(null);
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>{resume.file_name}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">ATS Improvement Context</span>
                </div>
                {renderScore("ATS Score", analysis.ats_score)}
                {renderScore("Technical Skills & Keywords", breakdown.keywords)}
                {renderScore("Metrics & Business Impact", breakdown.impact)}
                {renderScore("ATS Readability", breakdown.formatting)}
                {renderScore("Role Relevance", breakdown.relevance)}
              </div>

              <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">ATS Improvement Guidance</p>
                {bulletGuidance.length ? (
                  <ul className="space-y-2 text-xs text-slate-600">
                    {bulletGuidance.map((suggestion, index) => (
                      <li key={index} className="flex gap-2"><span className="text-amber-500">•</span><span>{suggestion}</span></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">Select a bullet and the enhancer will use the available ATS context.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select a Resume Bullet</label>
                <span className="text-xs text-slate-400">From your extracted resume</span>
              </div>
              {selectedResumeData?.bullets?.length ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedResumeData.bullets.map((bullet, index) => (
                    <button
                      key={`${index}-${bullet}`}
                      type="button"
                      onClick={() => { setSelectedBullet(bullet); setResult(null); setPreview(null); }}
                      className={`w-full text-left rounded-xl border p-3.5 text-sm transition-all ${selectedBullet === bullet ? "border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50"}`}
                    >
                      <span className="font-semibold text-emerald-600 mr-2">{index + 1}.</span>
                      <span className="text-slate-700">{bullet}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                  No bullet-style lines were detected. You can paste a bullet below as a fallback.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Selected / Draft Bullet</label>
              <textarea
                rows={3}
                value={selectedBullet}
                onChange={(e) => { setSelectedBullet(e.target.value); setResult(null); setPreview(null); }}
                placeholder="Select a resume bullet above or paste one here..."
                className="w-full rounded-xl border border-emerald-300 p-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-y"
              />
            </div>

            <button
              onClick={handleEnhance}
              disabled={loading || !resumeId || !selectedBullet.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? "Optimizing With ATS Context..." : "Generate 3 High-Impact Alternatives"}</span>
            </button>
          </div>

          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" />AI Enhanced Alternatives</h3>
                <span className="text-xs text-slate-400">Choose the version that remains factually accurate</span>
              </div>

              {result.metric_suggestion && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-slate-700">
                  <strong className="text-slate-900">Metric suggestion:</strong> {result.metric_suggestion}
                </div>
              )}

              <div className="space-y-4">
                {(result.suggestions || []).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-emerald-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">{item.style}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(item.text, idx)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {copiedIndex === idx ? <><Check className="w-3.5 h-3.5 text-emerald-600" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                        </button>
                        <button onClick={() => handlePreview(item, idx)} disabled={previewIndex === idx} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {previewIndex === idx ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}Preview ATS
                        </button>
                        <button onClick={() => handleSave(item, idx)} disabled={savingIndex === idx} className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-2.5 py-1 rounded-lg">
                          {savingIndex === idx ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">"{item.text}"</p>
                  </div>
                ))}
              </div>

              {preview && (
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">ATS Preview</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded-xl border border-slate-200 p-3">
                      <p className="text-slate-500">Before</p>
                      <p className="text-lg font-extrabold text-slate-900">{preview.before?.ats_score ?? "—"}</p>
                      <p className="text-slate-500">Metrics & Impact: {preview.before?.score_breakdown?.impact ?? "—"}%</p>
                    </div>
                    <div className="bg-white rounded-xl border border-emerald-200 p-3">
                      <p className="text-slate-500">Preview After</p>
                      <p className="text-lg font-extrabold text-emerald-700">{preview.after?.ats_score ?? "—"}</p>
                      <p className="text-slate-500">Metrics & Impact: {preview.after?.score_breakdown?.impact ?? "—"}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">{preview.message}</p>
                </div>
              )}

              {result.key_takeaways && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div><strong className="text-slate-900 mr-1">ATS/Recruiter Insight:</strong>{result.key_takeaways}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
