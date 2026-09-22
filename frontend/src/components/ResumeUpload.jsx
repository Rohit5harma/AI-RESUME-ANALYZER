import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Play,
} from "lucide-react";

export default function ResumeUpload({
  onFileUpload,
  isScanning,
  scanProgress,
  onLoadSampleResume,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    onFileUpload({ target: { files: [file] } });
  };

  const stages = [
    { label: "Validating PDF file format", percent: 20 },
    { label: "Extracting text and section headers", percent: 45 },
    { label: "Running ATS neural scoring model", percent: 75 },
    { label: "Synthesizing recruiter recommendations", percent: 100 },
  ];

  const currentStage = stages.find((s) => scanProgress <= s.percent) || stages[stages.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini AI Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Your Resume
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Upload your resume in PDF format to receive instant ATS scoring, keyword detection, and actionable suggestions.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        {isScanning ? (
          /* Scanning Progress View */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
              ></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 text-sm">
                {scanProgress}%
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-slate-900">
                Analyzing Your Resume...
              </h3>
              <p className="text-xs text-slate-500">
                {currentStage.label}
              </p>
            </div>

            {/* Stage Checklist */}
            <div className="w-full max-w-sm bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-left">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {scanProgress >= stage.percent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[10px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                  <span className={scanProgress >= stage.percent ? "font-medium text-slate-800" : "text-slate-400"}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
                  : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileInput}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-800">
                Click to upload or drag & drop
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Standard PDF formats supported (Max file size: 5MB)
              </p>

              <button
                type="button"
                className="mt-5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Select PDF File
              </button>
            </div>

            {/* Alternative: Test with Demo Resume */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Private & Encrypted • Your documents are never shared</span>
              </div>
              <button
                type="button"
                onClick={onLoadSampleResume}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700" />
                Try with Sample Software Engineer Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ATS Friendly Structure
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Use standard headers like "Work Experience", "Education", and "Technical Skills" for optimal parsing.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Quantifiable Metrics
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Include numbers, percentages, and metrics to demonstrate measurable business impact.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Machine Readability
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Avoid images, multi-column tables, or complex graphic layouts that confuse ATS parsers.
          </p>
        </div>
      </div>
    </div>
  );
}
