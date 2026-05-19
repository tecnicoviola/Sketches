"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare, Presentation, Cloud, Sparkles, Check } from "lucide-react";

export default function SketchesPlusPage() {
  return (
    <div className="plus-container">
      <style>{`
        .plus-container {
          min-height: 100vh;
          background: #15151a;
          color: #fff;
          font-family: 'Jost', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        /* Background Glow Effects */
        .glow-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .nav-header {
          width: 100%;
          max-width: 1000px;
          padding: 32px 24px;
          display: flex;
          justify-content: flex-start;
          z-index: 10;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .back-btn:hover {
          color: #fff;
        }

        .hero-section {
          text-align: center;
          max-width: 700px;
          padding: 60px 24px 40px;
          z-index: 10;
        }

        .plus-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 24px;
          border: 1px solid rgba(167, 139, 250, 0.3);
        }

        .hero-title {
          font-size: 48px;
          font-weight: 300;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-title em {
          font-style: italic;
          color: #a78bfa;
          font-weight: 400;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1000px;
          padding: 0 24px 60px;
          z-index: 10;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 32px;
          text-align: left;
          transition: transform 0.2s, background 0.2s;
        }
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(167, 139, 250, 0.1);
          color: #a78bfa;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .feature-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
        }

        .pricing-section {
          background: rgba(0,0,0,0.3);
          width: 100%;
          padding: 80px 24px;
          display: flex;
          justify-content: center;
          z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .pricing-card {
          background: linear-gradient(180deg, rgba(35,35,41,1) 0%, rgba(28,28,33,1) 100%);
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 24px;
          padding: 48px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }

        .price {
          font-size: 56px;
          font-weight: 300;
          margin: 24px 0;
        }
        .price span {
          font-size: 16px;
          color: rgba(255,255,255,0.4);
        }

        .pricing-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          text-align: left;
        }
        .pricing-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 16px;
        }

        .cta-btn {
          display: block;
          width: 100%;
          background: #a5b4fc;
          color: #111;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .cta-btn:hover {
          background: #c4b5fd;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="glow-blob" />

      {/* Navigation */}
      <div className="nav-header">
        <Link href="/dashboard" className="back-btn">
          <ArrowLeft size={16} /> Back to App
        </Link>
      </div>

      {/* Hero */}
      <div className="hero-section">
        <div className="plus-badge">
          <Sparkles size={14} /> Sketches+
        </div>
        <h1 className="hero-title">
          Where collaboration <em>truly</em> happens.
        </h1>
        <p className="hero-subtitle">
          Unlock threaded comments, presentation modes, unlimited libraries, and powerful AI features to take your canvas to the next level.
        </p>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><MessageSquare size={24} /></div>
          <h3 className="feature-title">Threaded Conversations</h3>
          <p className="feature-desc">Leave comments directly on the canvas. Tag your teammates, resolve discussions, and keep feedback exactly where the work is.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon"><Presentation size={24} /></div>
          <h3 className="feature-title">Presentation Mode</h3>
          <p className="feature-desc">Turn your infinite canvas into a structured slide deck. Guide your audience through your diagrams with smooth camera transitions.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><Cloud size={24} /></div>
          <h3 className="feature-title">Cloud Libraries</h3>
          <p className="feature-desc">Save your custom shapes and diagrams to your personal cloud library, making them accessible instantly across all your rooms.</p>
        </div>
      </div>

      {/* Pricing / CTA */}
      <div className="pricing-section">
        <div className="pricing-card">
          <h3>Pro Plan</h3>
          <div className="price">$8<span>/month</span></div>
          
          <ul className="pricing-list">
            <li><Check size={16} color="#a5b4fc" /> Unlimited threaded comments</li>
            <li><Check size={16} color="#a5b4fc" /> Presentation mode</li>
            <li><Check size={16} color="#a5b4fc" /> Unlimited cloud library items</li>
            <li><Check size={16} color="#a5b4fc" /> Priority AI generation (Claude 3.5)</li>
          </ul>

          <button className="cta-btn" onClick={() => alert("Subscription flow coming soon!")}>
            Start 14-day free trial
          </button>
        </div>
      </div>
    </div>
  );
}