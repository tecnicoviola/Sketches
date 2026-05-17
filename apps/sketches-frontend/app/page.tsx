"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

const HERO_IMAGE = "/lighthouse-hero.png";

const ROTATING_PHRASES = [
  "deep thinking.",
  "rough ideas.",
  "wild diagrams.",
  "quiet focus.",
  "bold plans.",
];

const FEATURES = [
  {
    n: "01",
    title: "Real-time",
    em: "Collaboration",
    body: "See your team's cursor moving in real time. Share a link with no accounts required for viewers and build together from anywhere in the world.",
  },
  {
    n: "02",
    title: "Infinite",
    em: "Canvas",
    body: "Zoom out to the full map. Zoom in to a detail. Your diagram is never cramped. Expand into space as your thinking grows and branches.",
  },
  {
    n: "03",
    title: "Smart",
    em: "Drawing",
    body: "Rough shapes snap into clean geometry. Handwritten notes stay expressive. AI-assisted diagram creation lets the tool keep up with your thought.",
  },
  {
    n: "04",
    title: "Version",
    em: "History",
    body: "Every stroke is saved. Step back through the evolution of an idea or restore a session from any point without losing what came after.",
  },
  {
    n: "05",
    title: "Export",
    em: "Anywhere",
    body: "PNG, SVG, PDF with one click. Or embed your canvas in Notion, Confluence, or any iframe-friendly tool. Your work travels.",
  },
  {
    n: "06",
    title: "Open",
    em: "Foundation",
    body: "Built on Excalidraw, trusted by millions. Your data stays yours. No lock-in, no black boxes, no surprises.",
  },
];

export default function App() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  const [animState, setAnimState] = useState<
    "visible" | "exiting" | "entering"
  >("visible");

  const [page, setPage] = useState<0 | 1>(0);

  const [ripple, setRipple] = useState({
    x: 0,
    y: 0,
    active: false,
  });

  const btnRef = useRef<HTMLAnchorElement>(null);

  const isSnapping = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimState("exiting");

      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % ROTATING_PHRASES.length);

        setAnimState("entering");

        setTimeout(() => setAnimState("visible"), 40);
      }, 400);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  const snapTo = useCallback((target: 0 | 1) => {
    if (isSnapping.current) return;

    isSnapping.current = true;

    setPage(target);

    setTimeout(() => {
      isSnapping.current = false;
    }, 950);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isSnapping.current) return;

      if (e.deltaY > 5) snapTo(1);
      else if (e.deltaY < -5) snapTo(0);
    };

    let ty = 0;

    const onTouchStart = (e: TouchEvent) => {
      ty = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const diff = ty - e.changedTouches[0].clientY;

      if (Math.abs(diff) < 30) return;

      snapTo(diff > 0 ? 1 : 0);
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
    });

    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
    });

    window.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [snapTo]);

  const handleBtnMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const rect = btnRef.current?.getBoundingClientRect();

    if (!rect) return;

    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleBtnMouseLeave = () => {
    setRipple((r) => ({
      ...r,
      active: false,
    }));
  };

  return (
    <div style={{ fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --moonlight: #F0ECDD;
          --frost: #8BA3C5;
          --oxford: #02122F;
        }

        html,
        body {
          overflow: hidden;
          height: 100%;
          background: var(--oxford);
        }

        .sk-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;

          z-index: 200;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 28px 52px;

          background: linear-gradient(
            to bottom,
            rgba(2,18,47,0.88) 0%,
            transparent 100%
          );

          pointer-events: none;
        }

        .sk-nav > * {
          pointer-events: auto;
        }

        .sk-nav-wordmark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 5px;
          text-transform: uppercase;

          color: var(--moonlight);

          background: none;
          border: none;

          cursor: pointer;
        }

        .sk-nav-cta {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;

          color: var(--moonlight);

          text-decoration: none;

          border: 1px solid rgba(240,236,221,0.3);

          padding: 10px 22px;

          transition:
            background 0.22s ease,
            border-color 0.22s ease,
            color 0.22s ease;
        }

        .sk-nav-cta:hover {
          background: rgba(240,236,221,0.08);
          border-color: rgba(240,236,221,0.6);
          color: var(--moonlight);
        }

        .sk-hero {
          position: fixed;
          inset: 0;

          z-index: 1;

          display: flex;
          flex-direction: column;
          justify-content: flex-end;

          overflow: hidden;

          transition:
            transform 0.9s cubic-bezier(0.76,0,0.24,1),
            opacity 0.9s cubic-bezier(0.76,0,0.24,1);
        }

        .sk-hero.page-up {
          transform: translateY(-100vh);
          opacity: 0;
          pointer-events: none;
        }

        .sk-hero-img {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center 30%;

          filter: brightness(0.55);
        }

        .sk-hero-overlay {
          position: absolute;
          inset: 0;

          background: linear-gradient(
            to bottom,
            rgba(2,18,47,0.22) 0%,
            transparent 38%,
            transparent 52%,
            rgba(2,18,47,0.72) 78%,
            rgba(2,18,47,0.97) 100%
          );
        }

        .sk-hero-content {
          position: relative;
          z-index: 2;

          padding: 0 53px 30px;

          max-width: 900px;
        }

        .sk-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(54px, 7vw, 92px);
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

          transition:
            transform 0.4s cubic-bezier(0.4,0,0.2,1),
            opacity 0.4s ease;
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

        .sk-hero-sub {
          font-size: 15px;
          font-weight: 300;

          color: rgba(240,236,221,0.52);

          line-height: 1.78;

          max-width: 440px;

          margin-bottom: 48px;
        }

        .sk-hero-actions {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .sk-btn-primary {
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

          display: inline-flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          position: relative;
          overflow: hidden;
        }

        .sk-btn-primary span:not(.sk-ripple) {
          position: relative;
          z-index: 2;
        }

        .sk-ripple {
          position: absolute;

          width: 12px;
          height: 12px;

          border-radius: 50%;

          background: #d8d2be;

          transform: translate(-50%, -50%) scale(0);

          transition:
            transform 0.6s cubic-bezier(0.22,1,0.36,1);

          z-index: 1;
        }

        .sk-btn-primary:hover .sk-ripple.active {
          transform: translate(-50%, -50%) scale(38);
        }

        .sk-btn-ghost {
          font-family: 'Jost', sans-serif;

          font-size: 10px;
          font-weight: 500;

          letter-spacing: 3.5px;
          text-transform: uppercase;

          color: rgba(240,236,221,0.65);

          background: none;
          border: none;

          border-bottom: 1px solid rgba(240,236,221,0.2);

          padding: 18px 0;

          display: inline-flex;
          align-items: center;
          gap: 10px;

          cursor: pointer;
        }

        .sk-features-panel {
          position: fixed;
          inset: 0;

          z-index: 2;

          background: var(--oxford);

          overflow: hidden;

          transform: translateY(100vh);
          opacity: 0;

          transition:
            transform 0.9s cubic-bezier(0.76,0,0.24,1),
            opacity 0.9s cubic-bezier(0.76,0,0.24,1);

          pointer-events: none;
        }

        .sk-features-panel.page-visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .sk-feat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;

          padding: 96px 52px 24px;
        }

        .sk-feat-title {
          font-family: 'Cormorant Garamond', serif;

          font-size: clamp(26px, 2.8vw, 40px);

          font-weight: 300;

          line-height: 1.15;

          color: var(--moonlight);
        }

        .sk-feat-title em {
          font-style: italic;
        }

        .sk-feat-desc {
          font-size: 14px;
          font-weight: 300;

          color: rgba(240,236,221,0.42);

          line-height: 1.9;

          max-width: 420px;

          text-align: right;
        }

        .sk-feat-grid-wrap {
          padding: 0 52px 50px;
        }

        .sk-feat-grid {
          width: 100%;

          display: grid;

          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 290px);

          border-left: 1px solid rgba(139,163,197,0.10);
          border-top: 1px solid rgba(139,163,197,0.10);
        }

        .sk-feat-card {
          background: var(--oxford);

          padding: 38px 42px 30px;

          border-right: 1px solid rgba(139,163,197,0.10);
          border-bottom: 1px solid rgba(139,163,197,0.10);

          display: flex;
          flex-direction: column;

          transition: background 0.25s;
        }

        .sk-feat-card:hover {
          background: rgba(35,53,77,0.72);
        }

        .sk-feat-num {
          font-family: 'Cormorant Garamond', serif;

          font-size: 17px;

          letter-spacing: 2px;

          color: var(--frost);

          opacity: 0.42;

          margin-bottom: 18px;
        }

        .sk-feat-name {
          font-family: 'Cormorant Garamond', serif;

          font-size: clamp(24px, 2vw, 30px);

          font-weight: 400;

          color: var(--moonlight);

          line-height: 1.15;

          margin-bottom: 18px;
        }

        .sk-feat-name em {
          font-style: italic;
          font-weight: 300;
        }

        .sk-feat-body {
          font-size: 14px;
          font-weight: 300;

          color: rgba(240,236,221,0.42);

          line-height: 1.9;

          max-width: 92%;
        }

        @media (max-width: 860px) {
          .sk-nav {
            padding: 22px 24px;
          }

          .sk-hero-content {
            padding: 0 24px 72px;
          }

          .sk-feat-header {
            padding: 88px 24px 24px;

            flex-direction: column;
            align-items: flex-start;

            gap: 18px;
          }

          .sk-feat-desc {
            text-align: left;
          }

          .sk-feat-grid-wrap {
            padding: 0 24px 50px;
          }

          .sk-feat-grid {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(6, auto);
          }

          .sk-feat-card {
            padding: 36px 28px;
            min-height: 220px;
          }
        }
      `}</style>

      <nav className="sk-nav">
        <button
          className="sk-nav-wordmark"
          onClick={() => snapTo(0)}
        >
          Sketches
        </button>

        <Link href="/signin" className="sk-nav-cta">
          Sign In
        </Link>
      </nav>

      <section
        className={`sk-hero${page === 1 ? " page-up" : ""}`}
      >
        <img
          className="sk-hero-img"
          src={HERO_IMAGE}
          alt="Lighthouse"
        />

        <div className="sk-hero-overlay" />

        <div className="sk-hero-content">
          <h1 className="sk-hero-title">
            <span className="sk-title-static">
              A canvas for
            </span>

            <span className="sk-title-clip">
              <em
                className={`sk-phrase${
                  animState === "exiting"
                    ? " sk-phrase-exiting"
                    : animState === "entering"
                    ? " sk-phrase-entering"
                    : ""
                }`}
              >
                {ROTATING_PHRASES[phraseIndex]}
              </em>
            </span>
          </h1>

          <p className="sk-hero-sub">
            Draw, diagram, and collaborate without friction.
            Built on Excalidraw's open canvas, refined into
            something worth returning to.
          </p>

          <div className="sk-hero-actions">
            <Link
              href="/signup"
              className="sk-btn-primary"
              ref={btnRef}
              onMouseEnter={handleBtnMouseEnter}
              onMouseLeave={handleBtnMouseLeave}
            >
              <span
                className={`sk-ripple${
                  ripple.active ? " active" : ""
                }`}
                style={{
                  left: ripple.x,
                  top: ripple.y,
                }}
              />

              <span>Open Canvas</span>
            </Link>

            <button
              className="sk-btn-ghost"
              onClick={() => snapTo(1)}
            >
              Explore features

              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
              >
                <path
                  d="M1 1l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section
        className={`sk-features-panel${
          page === 1 ? " page-visible" : ""
        }`}
      >
        <div className="sk-feat-header">
          <h2 className="sk-feat-title">
            Built for the way
            <br />
            <em>ideas actually move.</em>
          </h2>

          <p className="sk-feat-desc">
            Most tools interrupt thinking. Sketches stays
            out of the way, giving you presence, space,
            and tools that keep up with your pace.
          </p>
        </div>

        <div className="sk-feat-grid-wrap">
          <div className="sk-feat-grid">
            {FEATURES.map((f) => (
              <div className="sk-feat-card" key={f.n}>
                <span className="sk-feat-num">
                  {f.n}
                </span>

                <p className="sk-feat-name">
                  {f.title}
                  <br />
                  <em>{f.em}</em>
                </p>

                <p className="sk-feat-body">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}