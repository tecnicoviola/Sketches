"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PANEL_IMAGE = "/garden-night.png";

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
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!isSigninMode && !name) { setError("Please enter your full name."); return; }
    setLoading(true);
    try {
      if (isSigninMode) {
        const res = await fetch("http://localhost:3004/signin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          mode: "cors", body: JSON.stringify({ email, password }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Sign in failed."); return; }
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        router.push("/dashboard");
      } else {
        const res = await fetch("http://localhost:3004/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          mode: "cors", body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.message || "Sign up failed."); return; }
        router.push("/signin");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --moonlight: #F0ECDD;
          --frost:     #8BA3C5;
          --steel:     #495B7D;
          --storm:     #23354D;
          --oxford:    #02122F;
        }

        /* ── Left artwork panel — single clean rule ── */
        .sk-left {
          flex: 1 1 55%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: none;
        }
        @media (min-width: 860px) {
          .sk-left { display: block; }
        }

        .sk-left-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center left;
          filter: brightness(0.72);
          transition: transform 14s ease;
        }
        .sk-left:hover .sk-left-img { transform: scale(1.04); }

        .sk-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(2,18,47,0.08) 0%, rgba(2,18,47,0.50) 100%);
          pointer-events: none;
        }

        .sk-left-text {
          position: absolute;
          bottom: 56px;
          left: 48px;
          z-index: 2;
          color: var(--moonlight);
        }
        .sk-left-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--frost);
          margin-bottom: 14px;
        }
        .sk-left-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 3.8vw, 52px);
          font-weight: 300;
          line-height: 1.15;
          letter-spacing: -0.3px;
          max-width: 320px;
        }
        .sk-left-title em { font-style: italic; font-weight: 400; }
        .sk-left-rule {
          width: 36px;
          height: 1px;
          background: var(--frost);
          margin: 22px 0;
          opacity: 0.55;
        }
        .sk-left-sub {
          font-size: 14px;
          font-weight: 400;
          color: rgba(240,236,221,0.58);
          letter-spacing: 0.25px;
          line-height: 1.7;
          max-width: 270px;
        }

        /* ── Right form panel ── */
        .sk-right {
          flex: 0 0 420px;
          min-height: 100vh;
          background: var(--moonlight);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 52px;
        }
        @media (max-width: 860px) {
          .sk-right { flex: 1 1 100%; padding: 48px 28px; }
        }

        @keyframes sk-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sk-form {
          width: 100%;
          max-width: 320px;
          animation: sk-rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }

        .sk-wordmark {
          display: block;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 4.5px;
          text-transform: uppercase;
          color: var(--steel);
          margin-bottom: 56px;
        }

        .sk-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 38px;
          font-weight: 300;
          color: var(--oxford);
          line-height: 1.1;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }
        .sk-heading em { font-style: italic; font-weight: 400; }

        .sk-tagline {
          font-size: 12.5px;
          font-weight: 300;
          color: var(--steel);
          letter-spacing: 0.2px;
          margin-bottom: 44px;
          line-height: 1.5;
        }

        .sk-field { margin-bottom: 28px; }
        .sk-field-label {
          display: block;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2.8px;
          text-transform: uppercase;
          color: var(--steel);
          margin-bottom: 10px;
          opacity: 0.7;
        }
        .sk-input {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(73,91,125,0.25);
          padding: 7px 0 11px;
          color: var(--oxford);
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.22s;
          letter-spacing: 0.15px;
        }
        .sk-input::placeholder { color: rgba(73,91,125,0.3); }
        .sk-input[type="password"]::placeholder {
          color: rgba(73,91,125,0.5);
          font-size: 22px;
          letter-spacing: 4px;
          line-height: 1;
        }
        .sk-input:focus { border-bottom-color: var(--oxford); }

        .sk-error {
          font-size: 12px;
          color: #9b3a2e;
          padding: 10px 14px;
          background: rgba(155,58,46,0.07);
          border-left: 2px solid #9b3a2e;
          margin-bottom: 20px;
          letter-spacing: 0.1px;
          font-weight: 400;
        }

        .sk-btn {
          display: block;
          width: 100%;
          padding: 16px 24px;
          margin-top: 40px;
          margin-bottom: 34px;
          background: var(--oxford);
          color: var(--moonlight);
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          border-radius: 1px;
          transition: background 0.22s, transform 0.18s, box-shadow 0.22s;
        }
        .sk-btn:hover:not(:disabled) {
          background: var(--storm);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(2,18,47,0.18);
        }
        .sk-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sk-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
        }
        .sk-divider-line { flex: 1; height: 1px; background: rgba(73,91,125,0.15); }
        .sk-divider-text {
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(73,91,125,0.4);
        }

        .sk-toggle {
          text-align: center;
          font-size: 12.5px;
          font-weight: 300;
          color: var(--steel);
          letter-spacing: 0.1px;
        }
        .sk-toggle-link {
          color: var(--oxford);
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(2,18,47,0.3);
          margin-left: 5px;
          transition: text-decoration-color 0.2s;
        }
        .sk-toggle-link:hover { text-decoration-color: var(--oxford); }
      `}</style>

      {/* Left artwork panel */}
      <div className="sk-left">
        <img
          className="sk-left-img"
          src={PANEL_IMAGE}
          alt="Aerial view of a golden pavilion nestled in deep indigo forest at night"
        />
        <div className="sk-left-text">
          <p className="sk-left-eyebrow">Sketches</p>
          <h1 className="sk-left-title">
            Where ideas <em>find their</em> form.
          </h1>
          <div className="sk-left-rule" />
          <p className="sk-left-sub">
            A canvas for thinking, draw, diagram,<br />
            and collaborate without friction.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="sk-right">
        <div className="sk-form">
          <span className="sk-wordmark">Sketches</span>

          <h2 className="sk-heading">
            {isSigninMode
              ? <><em>Welcome</em> back.</>
              : <>Begin <em>creating.</em></>}
          </h2>
          <p className="sk-tagline">
            {isSigninMode
              ? "Sign in to return to your canvas."
              : "Create a free account to get started."}
          </p>

          {!isSigninMode && (
            <div className="sk-field">
              <label className="sk-field-label">Full Name</label>
              <input className="sk-input" type="text" placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="sk-field">
            <label className="sk-field-label">Email</label>
            <input className="sk-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="sk-field">
            <label className="sk-field-label">Password</label>
            <input className="sk-input" type="password" placeholder="········"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <div className="sk-error">{error}</div>}

          <button className="sk-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" : isSigninMode ? "Sign In" : "Create Account"}
          </button>

          <div className="sk-divider">
            <div className="sk-divider-line" />
            <span className="sk-divider-text">or</span>
            <div className="sk-divider-line" />
          </div>

          <p className="sk-toggle">
            {isSigninMode ? "Don't have an account?" : "Already have an account?"}
            <span className="sk-toggle-link"
              onClick={() => { setError(""); setMode(isSigninMode ? "signup" : "signin"); }}>
              {isSigninMode ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}