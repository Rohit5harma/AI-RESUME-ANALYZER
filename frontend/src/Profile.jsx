import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Code2,
  Globe,
  Edit3,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { fetchUserProfile, updateUserProfile } from "./api";

export default function Profile({ onShowToast }) {
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 555-0199",
    location: "San Francisco, CA",
    preferred_role: "Full Stack Software Engineer",
    experience: "3+ Years",
    expected_salary: "$120k - $150k",
    preferred_location: "Remote / Hybrid",
    skills: ["Python", "Django", "React", "TypeScript", "PostgreSQL", "Docker", "Git"],
    portfolio: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...profileData,
    skills: profileData.skills.join(", "),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetchUserProfile();
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          ...data,
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills,
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const skillsArray = typeof formData.skills === "string"
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : formData.skills;

    try {
      const response = await updateUserProfile({
        ...formData,
        skills: skillsArray,
      });

      if (response.ok) {
        const result = await response.json();
        const updated = result.profile || formData;
        setProfileData({ ...updated, skills: skillsArray });
        setIsEditing(false);
        if (onShowToast) onShowToast("Profile updated successfully!", "success");
      } else {
        throw new Error("Failed to update profile.");
      }
    } catch (err) {
      console.error("Save error:", err);
      if (onShowToast) onShowToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            {profileData.name ? profileData.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {profileData.name}
            </h1>
            <p className="text-sm font-semibold text-emerald-600 mt-0.5">
              {profileData.preferred_role || "Software Engineer"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {profileData.location || "Location not set"} • {profileData.experience || "Experience not set"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setFormData({
              ...profileData,
              skills: Array.isArray(profileData.skills) ? profileData.skills.join(", ") : profileData.skills,
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal & Career Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Current Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Target Job Role
                </label>
                <input
                  type="text"
                  name="preferred_role"
                  value={formData.preferred_role}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Preferred Location / Mode
                </label>
                <input
                  type="text"
                  name="preferred_location"
                  value={formData.preferred_location}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Core Skills (comma separated)
              </label>
              <textarea
                name="skills"
                rows={3}
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Profile Information
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-800">{profileData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-slate-800">{profileData.phone || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold text-slate-800">{profileData.location || "-"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Target Role</span>
                <span className="font-semibold text-slate-800">{profileData.preferred_role || "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Verified Core Skills</span>
              <span className="text-xs text-emerald-600 font-bold">
                {profileData.skills?.length || 0} Listed
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                profileData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills added yet</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}