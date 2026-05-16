"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">(
    isSignin ? "signin" : "signup"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const isSigninMode = mode === "signin";

  async function handleSubmit() {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isSigninMode && !name) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isSigninMode) {
        const res = await fetch("http://localhost:3004/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Sign in failed. Please try again.");
          return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        router.push("/dashboard");

      } else {
        const res = await fetch("http://localhost:3004/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.message || "Sign up failed. Please try again.");
          return;
        }

        router.push("/signin");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: "1rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .auth-subtitle {
          text-align: center;
          font-size: 13.5px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 36px;
          font-weight: 300;
          letter-spacing: 0.2px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        .input-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 6px;
        }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          outline: none;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input:focus {
          border-color: rgba(139, 92, 246, 0.7);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .auth-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
          margin-bottom: 20px;
        }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.55);
          background: linear-gradient(135deg, #6d28d9, #9333ea);
        }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error-msg {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 16px;
          text-align: center;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
        .divider-text { font-size: 11.5px; color: rgba(255,255,255,0.3); letter-spacing: 0.5px; }
        .toggle-text { text-align: center; font-size: 13.5px; color: rgba(255,255,255,0.4); }
        .toggle-link {
          color: #a78bfa;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.2s;
        }
        .toggle-link:hover { color: #c4b5fd; }
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <div className="orb" style={{ width: 400, height: 400, background: "#7c3aed", top: "-100px", left: "-100px" }} />
      <div className="orb" style={{ width: 300, height: 300, background: "#ec4899", bottom: "-80px", right: "-60px" }} />

      <div className="auth-card" style={{ position: "relative", zIndex: 1 }}>
        <div className="auth-logo">Sketches ✦</div>
        <div className="auth-subtitle">
          {isSigninMode ? "Welcome back — sign in to continue" : "Create an account to get started"}
        </div>

        <div className="input-group">
          {!isSigninMode && (
            <div>
              <label className="input-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="input-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isSigninMode ? "Sign In →" : "Create Account →"}
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">or</span>
          <div className="divider-line" />
        </div>

        <div className="toggle-text">
          {isSigninMode ? "Don't have an account?" : "Already have an account?"}
          <span
            className="toggle-link"
            onClick={() => { setError(""); setMode(isSigninMode ? "signup" : "signin"); }}
          >
            {isSigninMode ? "Sign up" : "Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}