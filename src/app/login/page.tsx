"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Force page load to dashboard so middleware triggers fresh session check
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-md relative overflow-hidden font-sans">
      {/* Decorative Gradient Background Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-teal-500/10 to-teal-500/0 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-teal-700/5 to-teal-700/0 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-lg flex flex-col z-10 transition-all duration-300">
        
        {/* Header Block */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-teal-800 border border-teal-100 shadow-sm mb-md">
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Welcome back to DukanMitra" : "Create DukanMitra Account"}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin
              ? "Sign in to manage your AI Inventory, Sales, and Recovery Employees"
              : "Register your SME store to deploy autonomous AI WhatsApp agents"}
          </p>
        </div>

        {/* Form Error Alert Block */}
        {error && (
          <div className="mb-md p-sm bg-red-50 border border-red-200 rounded-xl flex items-center gap-xs text-xs font-semibold text-red-800">
            <span className="material-symbols-outlined text-red-600 text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-md">
          {!isLogin && (
            <div className="space-y-xs">
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">person</span>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-sm text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-xs">
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">mail</span>
              <input
                id="email"
                type="email"
                required
                placeholder="e.g. owner@dukanmitra.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-sm text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">lock</span>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-sm text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-xs">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-sm">
                {["Owner", "Manager"].map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setRole(roleOption)}
                    className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      role === roleOption
                        ? "bg-teal-50 border-teal-600 text-teal-800"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700 bg-transparent"
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-800 hover:bg-teal-900 disabled:bg-teal-700 text-white font-bold py-md rounded-xl text-sm transition-all shadow-md mt-lg flex items-center justify-center gap-xs"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <span className="material-symbols-outlined text-sm">login</span>
            )}
            <span>{isLogin ? "Sign In" : "Register Store"}</span>
          </button>
        </form>

        {/* Footer State Toggle Block */}
        <div className="mt-xl text-center border-t border-slate-100 pt-md">
          <p className="text-xs text-slate-500">
            {isLogin ? "New to DukanMitra?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-teal-800 hover:text-teal-900 font-bold hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
