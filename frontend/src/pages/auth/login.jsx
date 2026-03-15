

import React, { useState } from "react";
import supabase from "../../services/supabaseClient";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Save token and user info
    localStorage.setItem("access_token", data.session.access_token);
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("user_email", data.user.email);

    // ✅ Check role from Supabase profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Could not fetch profile:", profileError.message);
      window.location.href = "/";
      return;
    }

    // ✅ Redirect based on actual role set in Supabase — not a button click
    if (profile.role === "admin") {
      window.location.href = "/admin/blogs";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Sign in to your account
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                name="email"
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                placeholder="Email address"
                onChange={handleChange}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-yellow-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                name="password"
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-white/10 rounded bg-white/5"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/60">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group cursor-pointer relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-sm text-white/60">
            Don't have an account?{" "}
            <a href="/register" className="text-yellow-400 font-medium hover:text-yellow-300">
              Register now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
