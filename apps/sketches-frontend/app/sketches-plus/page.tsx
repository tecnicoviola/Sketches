"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Presentation, Cloud, Check } from "lucide-react";

const ROTATING_PLUS_PHRASES = [
  "truly happens.",
  "takes form.",
  "comes together.",
  "unlocks focus.",
  "reaches scale.",
];

export default function SketchesPlusPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exiting" | "entering">("visible");

  useEffect(() => {
    const id = setInterval(() => {
      setAnimState("exiting");
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % ROTATING_PLUS_PHRASES.length);
        setAnimState("entering");
        setTimeout(() => setAnimState("visible"), 40);
      }, 400);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="sk-plus-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --moonlight: #F0ECDD;
          --oxford: #02122F;
        }

        .sk-plus-root {
          min-height: 100vh;
          background: var(--oxford);
          color: var(--moonlight);
          font-family: 'Jost', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Full-bleed Hero Background matching landing page treatment */
        .hero-bg-wrap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          z-index: 1;
        }
        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.65);
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(2, 18, 47, 0.22) 0%,
            transparent 38%,
            transparent 52%,
            rgba(2, 18, 47, 0.72) 78%,
            rgba(2, 18, 47, 0.97) 100%
          );
        }

        /* Top Navigation Header */
        .sk-plus-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 52px;
          background: linear-gradient(to bottom, rgba(2, 18, 47, 0.88) 0%, transparent 100%);
          pointer-events: none;
        }
        .sk-plus-nav > * {
          pointer-events: auto;
        }
        .sk-nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--moonlight);
          text-decoration: none;
        }
        .sk-nav-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--moonlight);
          text-decoration: none;
          border: 1px solid rgba(240,236,221,0.3);
          padding: 10px 22px;
          transition: background 0.22s, border-color 0.22s, color 0.22s;
        }
        .sk-nav-back:hover {
          background: rgba(240,236,221,0.08);
          border-color: rgba(240,236,221,0.6);
          color: var(--moonlight);
        }

        /* Hero Content Container - Repositioned to Bottom-Left */
        .hero-container {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 53px 40px;
          max-width: 850px;
        }
        .hero-tag {
          display: inline-block;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: rgba(240, 236, 221, 0.6);
          margin-bottom: 16px;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 7vw, 86px);
          font-weight: 300;
          line-height: 1.06;
          letter-spacing: -0.5px;
          color: var(--moonlight);
          margin-bottom: 28px;
        }
        .sk-title-static {
          display: block;
        }
        .sk-title-clip {
          display: block;
          overflow: hidden;
          height: 1.12em;
        }
        .sk-phrase {
          display: block;
          font-style: italic;
          font-weight: 400;
          transform: translateY(0%);
          opacity: 1;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease;
        }
        .sk-phrase-exiting {
          transform: translateY(-115%);
          opacity: 0;
        }
        .sk-phrase-entering {
          transform: translateY(115%);
          opacity: 0;
          transition: none;
        }

        .hero-subtext {
          font-size: 15px;
          font-weight: 300;
          color: rgba(240, 236, 221, 0.55);
          line-height: 1.78;
          max-width: 440px;
          margin-bottom: 48px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .btn-primary {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: var(--oxford);
          background: var(--moonlight);
          border: none;
          padding: 18px 38px;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.22s, transform 0.22s;
        }
        .btn-primary:hover {
          background: rgba(240, 236, 221, 0.88);
          transform: translateY(-1px);
        }

        /* Features Section */
        .features-section {
          position: relative;
          z-index: 10;
          padding: 60px 53px 100px;
          max-width: 1200px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: rgba(2, 18, 47, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(240, 236, 221, 0.12);
          border-radius: 12px;
          padding: 32px 28px;
          transition: transform 0.25s, border-color 0.25s, background 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(240, 236, 221, 0.25);
          background: rgba(2, 18, 47, 0.9);
        }
        .feature-chip {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(240, 236, 221, 0.04);
          border: 1px solid rgba(240, 236, 221, 0.12);
          color: var(--moonlight);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          color: var(--moonlight);
          margin-bottom: 12px;
        }
        .feature-desc {
          font-size: 13.5px;
          font-weight: 300;
          color: rgba(240, 236, 221, 0.65);
          line-height: 1.65;
        }

        /* Pricing Section */
        .pricing-section {
          position: relative;
          z-index: 10;
          padding: 60px 53px 120px;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .pricing-card {
          width: 100%;
          max-width: 440px;
          background: #02122F;
          border: 1px solid rgba(240, 236, 221, 0.18);
          border-radius: 16px;
          padding: 44px 36px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
        }
        .pricing-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          color: var(--moonlight);
          margin-bottom: 8px;
        }
        .price-display {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 300;
          color: var(--moonlight);
          margin: 20px 0;
          line-height: 1;
        }
        .price-display span {
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: rgba(240, 236, 221, 0.5);
          margin-left: 6px;
        }
        .pricing-list {
          list-style: none;
          padding: 0;
          margin: 0 0 36px 0;
        }
        .pricing-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13.5px;
          font-weight: 300;
          color: rgba(240, 236, 221, 0.8);
          margin-bottom: 14px;
        }

        @media (max-width: 768px) {
          .sk-plus-nav { padding: 20px 24px; }
          .hero-container { padding: 100px 24px 40px; }
          .features-section { padding: 40px 24px 60px; }
          .pricing-section { padding: 40px 24px 80px; }
        }
      `}</style>

      {/* Hero Background Image & Landing Page Overlay */}
      <div className="hero-bg-wrap">
        <img src="/orbital-dawn.png" alt="Orbital Dawn" className="hero-bg-img" />
        <div className="hero-bg-overlay" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="sk-plus-nav">
        <Link href="/dashboard" className="sk-nav-brand">
          SKETCHES
        </Link>
        <Link href="/dashboard" className="sk-nav-back">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </nav>

      {/* Hero Section - Bottom-Left Viewport Positioning */}
      <section className="hero-container">
        <span className="hero-tag">SKETCHES+ PRO</span>
        
        <h1 className="hero-headline">
          <span className="sk-title-static">Where collaboration</span>
          <span className="sk-title-clip">
            <span
              className={`sk-phrase ${
                animState === "exiting"
                  ? "sk-phrase-exiting"
                  : animState === "entering"
                  ? "sk-phrase-entering"
                  : ""
              }`}
            >
              {ROTATING_PLUS_PHRASES[phraseIndex]}
            </span>
          </span>
        </h1>

        <p className="hero-subtext">
          Unlock threaded conversations, presentation modes, cloud shape libraries, and priority AI generation to elevate your team's workflow.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => alert("Subscription flow coming soon!")}>
            Start 14-day free trial
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-chip">
              <MessageSquare size={20} />
            </div>
            <h3 className="feature-title">Threaded Conversations</h3>
            <p className="feature-desc">
              Leave comments directly on the canvas. Tag teammates, resolve discussions, and keep feedback anchored right where the work is built.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-chip">
              <Presentation size={20} />
            </div>
            <h3 className="feature-title">Presentation Mode</h3>
            <p className="feature-desc">
              Turn your infinite canvas into a structured presentation deck. Guide your audience through your diagrams with smooth camera transitions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-chip">
              <Cloud size={20} />
            </div>
            <h3 className="feature-title">Cloud Libraries</h3>
            <p className="feature-desc">
              Save your custom shapes and diagrams to your personal cloud library, making them accessible instantly across all your rooms.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="pricing-card">
          <h3 className="pricing-card-title">Pro Plan</h3>
          <div className="price-display">
            $8 <span>/ month</span>
          </div>

          <ul className="pricing-list">
            <li>
              <Check size={16} color="#F0ECDD" /> Unlimited threaded comments
            </li>
            <li>
              <Check size={16} color="#F0ECDD" /> Presentation mode
            </li>
            <li>
              <Check size={16} color="#F0ECDD" /> Unlimited cloud library items
            </li>
            <li>
              <Check size={16} color="#F0ECDD" /> Priority AI generation (Claude 3.5)
            </li>
          </ul>

          <button className="btn-primary" style={{ width: "100%" }} onClick={() => alert("Subscription flow coming soon!")}>
            Start 14-day free trial
          </button>
        </div>
      </section>
    </div>
  );
}