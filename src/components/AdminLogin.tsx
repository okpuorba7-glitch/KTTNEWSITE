import React, { useState } from "react";
import Logo from "./Logo";

export default function AdminLogin({ 
  onGoogleLogin, 
  onPasswordLogin, 
  close 
}: { 
  onGoogleLogin: () => void; 
  onPasswordLogin: (password: string) => boolean; 
  close: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<"google" | "password">("password");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    const success = onPasswordLogin(password.trim());
    if (!success) {
      setError("Incorrect password. Default is admin123 or check Site Settings.");
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-login" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Logo size={56} />
        </div>
        <h2>Admin Login</h2>
        <p style={{ marginBottom: 20 }}>Kings Treat Tech — Management Portal</p>

        {/* Login Method Tabs */}
        <div style={{ display: "flex", background: "#111", borderRadius: 8, padding: 4, marginBottom: 20, border: "1px solid #2A2A2A" }}>
          <button 
            type="button"
            onClick={() => { setMethod("password"); setError(""); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: method === "password" ? "#FF5E00" : "transparent", color: method === "password" ? "#fff" : "#888", transition: "all 0.2s" }}
          >
            🔑 Admin Password
          </button>
          <button 
            type="button"
            onClick={() => { setMethod("google"); setError(""); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: method === "google" ? "#FF5E00" : "transparent", color: method === "google" ? "#fff" : "#888", transition: "all 0.2s" }}
          >
            🔐 Google Auth
          </button>
        </div>

        {method === "password" ? (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#ccc", marginBottom: 6 }}>
                Enter Admin Password / PIN
              </label>
              <input 
                type="password" 
                placeholder="Enter password..."
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                autoFocus
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none" }}
              />
            </div>

            {error && (
              <div style={{ color: "#FF4D4D", fontSize: 12, marginBottom: 14, textAlign: "left", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="admin-login-btn" style={{ width: "100%", marginTop: 4 }}>
              Unlock Admin Portal ➔
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>
              Sign in with your registered Google account (<strong style={{ color: "#39FF14" }}>Chatkttlimited@gmail.com</strong> or registered Sub-Admin email).
            </p>
            <button className="admin-login-btn" style={{ width: "100%" }} onClick={onGoogleLogin}>
              🔐 Sign In with Google
            </button>
          </div>
        )}

        <button 
          onClick={close}
          style={{ background: "none", border: "none", color: "#666", marginTop: 18, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
        >
          Cancel
        </button>

        <div className="admin-hint" style={{ marginTop: 14, fontSize: 11, color: "#666" }}>
          Default password is <strong style={{ color: "#FF5E00" }}>admin123</strong> (Can be changed in Site Settings).
        </div>
      </div>
    </div>
  );
}

