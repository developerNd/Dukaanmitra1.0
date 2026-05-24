"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  const agents = [
    { icon: "storefront", label: "Sales Agent", desc: "Handles customer queries & quotations", color: "#006a61" },
    { icon: "receipt_long", label: "Recovery Agent", desc: "Monitors invoices & payment follow-ups", color: "#0d0093" },
    { icon: "inventory_2", label: "Inventory Agent", desc: "Tracks stock & predicts shortages", color: "#191c1e" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div
        style={{
          display: "none",
          flex: "0 0 45%",
          background: "linear-gradient(145deg, #091426 0%, #0d0093 60%, #006a61 100%)",
          padding: "48px 40px",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        className="login-left-panel"
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "rgba(134,242,228,0.08)", filter: "blur(60px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "-100px", left: "-60px",
          width: "360px", height: "360px", borderRadius: "50%",
          background: "rgba(13,0,147,0.25)", filter: "blur(80px)",
          pointerEvents: "none"
        }} />

        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "rgba(134,242,228,0.15)",
              border: "1px solid rgba(134,242,228,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span className="material-symbols-outlined" style={{ color: "#86f2e4", fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "18px", color: "#fff", letterSpacing: "-0.3px" }}>DukanMitra</div>
              <div style={{ fontSize: "11px", color: "rgba(134,242,228,0.7)", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Employees</div>
            </div>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "16px", letterSpacing: "-0.5px" }}>
            Your store runs<br />
            <span style={{ color: "#86f2e4" }}>itself, 24/7.</span>
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "340px" }}>
            Autonomous AI employees handle sales, payments, and inventory — so you never miss a lead or a payment.
          </p>
        </div>

        {/* Agent cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {agents.map((ag) => (
            <div key={ag.label} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(134,242,228,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <span className="material-symbols-outlined" style={{ color: "#86f2e4", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{ag.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{ag.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{ag.desc}</div>
              </div>
              <div style={{
                marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px",
                fontSize: "10px", fontWeight: 700, color: "#86f2e4",
                letterSpacing: "0.5px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#86f2e4", display: "inline-block" }} />
                LIVE
              </div>
            </div>
          ))}
        </div>

        {/* Footer stat strip */}
        <div style={{ display: "flex", gap: "28px" }}>
          {[["3s", "Avg Response"], ["99%", "Uptime"], ["0", "Staff Needed"]].map(([val, lab]) => (
            <div key={lab}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#86f2e4" }}>{val}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9fb",
        padding: "32px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle bg blobs for right panel */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "rgba(0,106,97,0.05)", filter: "blur(50px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-40px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(13,0,147,0.04)", filter: "blur(50px)", pointerEvents: "none"
        }} />

        <div style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Mobile-only logo */}
          <div className="login-mobile-logo" style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "32px", justifyContent: "center"
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #006a61, #0d0093)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "#091426" }}>DukanMitra</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#091426", marginBottom: "6px", letterSpacing: "-0.4px" }}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
              {isLogin
                ? "Sign in to your DukanMitra dashboard"
                : "Register your SME store and deploy AI agents"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "10px", marginBottom: "20px",
              fontSize: "13px", fontWeight: 600, color: "#b91c1c"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#ef4444" }}>error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {!isLogin && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#9ca3af" }}>person</span>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e5e7eb", borderRadius: "10px",
                      padding: "11px 14px 11px 40px",
                      fontSize: "14px", background: "#fff", color: "#111827",
                      outline: "none", transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#006a61"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#9ca3af" }}>mail</span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="owner@dukanmitra.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e5e7eb", borderRadius: "10px",
                    padding: "11px 14px 11px 40px",
                    fontSize: "14px", background: "#fff", color: "#111827",
                    outline: "none", transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#006a61"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#9ca3af" }}>lock</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e5e7eb", borderRadius: "10px",
                    padding: "11px 44px 11px 40px",
                    fontSize: "14px", background: "#fff", color: "#111827",
                    outline: "none", transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#006a61"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    display: "flex", alignItems: "center", color: "#9ca3af"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
                  Account Role
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {["Owner", "Manager"].map((roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      onClick={() => setRole(roleOption)}
                      style={{
                        padding: "10px 14px",
                        border: `1.5px solid ${role === roleOption ? "#006a61" : "#e5e7eb"}`,
                        borderRadius: "10px",
                        background: role === roleOption ? "#f0fdfa" : "#fff",
                        color: role === roleOption ? "#065f46" : "#6b7280",
                        fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                        {roleOption === "Owner" ? "store" : "badge"}
                      </span>
                      {roleOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 20px",
                background: loading ? "#4a9e96" : "linear-gradient(135deg, #006a61 0%, #065f46 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "11px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "6px",
                boxShadow: "0 4px 14px rgba(0,106,97,0.35)",
                transition: "all 0.2s",
                letterSpacing: "0.2px",
              }}
            >
              {loading ? (
                <span className="material-symbols-outlined" style={{ fontSize: "18px", animation: "spin 1s linear infinite" }}>sync</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
                  {isLogin ? "login" : "person_add"}
                </span>
              )}
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
            fontSize: "13px",
            color: "#9ca3af",
          }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#006a61", fontWeight: 700, fontSize: "13px",
                textDecoration: "underline", textUnderlineOffset: "3px",
              }}
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive + spin styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .login-left-panel {
            display: flex !important;
          }
          .login-mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
