import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginUser } from "./api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userId", data.user.id);

        if (onLoginSuccess) onLoginSuccess();
        navigate("/dashboard");
      } else {
        setError(data.error || data.detail || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server connection error. Please make sure the Django backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("demo@resumeai.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans pt-20">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col animate-in fade-in duration-300">
        <div className="mb-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to ResumeAI
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your resume insights & ATS analyses
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fill Demo Credentials (demo@resumeai.com)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-sm transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 pl-4 pr-11 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account yet?{" "}
          <Link to="/Register" className="font-bold text-emerald-600 hover:underline">
            Register for Free
          </Link>
        </p>
      </div>
    </div>
  );
}