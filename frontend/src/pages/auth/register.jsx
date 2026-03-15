

import React, { useState } from "react";
import { Mail, Lock, User, Users, CheckCircle2, BookOpen, Hash, GraduationCap } from "lucide-react";

const BRANCHES = [
  "Computer Engineering", "Information Technology", "Electronics & Communication",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Chemical Engineering", "Production & Industrial Engineering",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    branch: "", year: "", roll_number: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isMember && (!formData.branch || !formData.year || !formData.roll_number.trim())) {
      setError("Please fill in your branch, year, and roll number.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(isMember && {
          is_member: true,
          branch: formData.branch,
          year: formData.year,
          roll_number: formData.roll_number,
        }),
      };

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      setShowPopup(true);
      setTimeout(() => { window.location.href = "/login"; }, 1500);
    } catch (err) {
      setLoading(false);
      setError("Network error — is the backend running?");
    }
  };

  return (
    <>
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-yellow-400 text-black px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Account created! Please log in.</span>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="mt-2 text-sm text-white/60">Join the iCell community</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* Base fields */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <User size={18} />
                </div>
                <input name="name" type="text" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Full Name" onChange={handleChange} />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input name="email" type="email" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Email address" onChange={handleChange} />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input name="password" type="password" required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  placeholder="Password (min 8 characters)" onChange={handleChange} />
              </div>
            </div>

            {/* Member toggle */}
            <div
              onClick={() => setIsMember(!isMember)}
              className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                isMember
                  ? "border-yellow-400/50 bg-yellow-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isMember ? "bg-yellow-400 border-yellow-400" : "border-white/30"
              }`}>
                {isMember && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold transition-colors ${isMember ? "text-yellow-400" : "text-white/70"}`}>
                  I am a member of this society
                </p>
                <p className="text-xs text-white/40 mt-0.5">Fill in your academic details for member verification</p>
              </div>
              <Users size={18} className={isMember ? "text-yellow-400" : "text-white/30"} />
            </div>

            {/* Conditional member fields */}
            {isMember && (
              <div className="space-y-4 border border-yellow-400/20 rounded-2xl p-4 bg-yellow-400/5">
                <p className="text-xs text-yellow-400/70 font-medium uppercase tracking-wider">Member Details</p>

                {/* Branch */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                    <BookOpen size={18} />
                  </div>
                  <select name="branch" required={isMember}
                    value={formData.branch}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all appearance-none"
                    style={{ colorScheme: "dark" }}>
                    <option value="" disabled className="bg-zinc-900">Select your branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-zinc-900">{b}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                    <GraduationCap size={18} />
                  </div>
                  <select name="year" required={isMember}
                    value={formData.year}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all appearance-none"
                    style={{ colorScheme: "dark" }}>
                    <option value="" disabled className="bg-zinc-900">Select your year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-zinc-900">{y}</option>
                    ))}
                  </select>
                </div>

                {/* Roll number */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                    <Hash size={18} />
                  </div>
                  <input name="roll_number" type="text" required={isMember}
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                    placeholder="Roll Number (e.g. 22CSEB01)"
                    value={formData.roll_number}
                    onChange={handleChange} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="group cursor-pointer relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account…" : "Register"}
            </button>

            <p className="text-center text-sm text-white/60">
              Already have an account?{" "}
              <a href="/login" className="text-yellow-400 font-medium hover:text-yellow-300">Log in</a>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Register;