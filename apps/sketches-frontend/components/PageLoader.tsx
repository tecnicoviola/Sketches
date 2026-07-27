"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hide loader whenever pathname or searchParams change (navigation finished)
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept link clicks to trigger loader instantly
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.target !== "_blank" &&
        href !== pathname
      ) {
        setLoading(true);
      }
    };

    const anchors = document.querySelectorAll("a[href]");
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick as EventListener));

    // Also observe DOM changes for dynamically added links
    const observer = new MutationObserver(() => {
      const currentAnchors = document.querySelectorAll("a[href]");
      currentAnchors.forEach((a) => {
        a.removeEventListener("click", handleAnchorClick as EventListener);
        a.addEventListener("click", handleAnchorClick as EventListener);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick as EventListener));
      observer.disconnect();
    };
  }, [pathname]);

  if (!loading) return null;

  return <LoadingScreen />;
}

export function LoadingScreen({ message = "LOADING WORKSPACE..." }: { message?: string }) {
  return (
    <div className="sk-page-loader">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&display=swap');

        .sk-page-loader {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #02122F;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #F0ECDD;
          font-family: 'Jost', sans-serif;
          animation: skFadeIn 0.2s ease-out forwards;
        }

        @keyframes skFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sk-loader-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 400;
          letter-spacing: 7px;
          text-transform: uppercase;
          color: #F0ECDD;
          margin-bottom: 24px;
        }

        .sk-loader-spinner-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          margin-bottom: 24px;
        }

        .sk-loader-spinner {
          width: 44px;
          height: 44px;
          border: 2px solid rgba(240, 236, 221, 0.12);
          border-top-color: #F0ECDD;
          border-radius: 50%;
          animation: skSpin 0.8s linear infinite;
        }

        @keyframes skSpin {
          to { transform: rotate(360deg); }
        }

        .sk-loader-text {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: rgba(240, 236, 221, 0.6);
        }
      `}</style>

      <div className="sk-loader-brand">SKETCHES</div>
      <div className="sk-loader-spinner-wrap">
        <div className="sk-loader-spinner" />
      </div>
      <div className="sk-loader-text">{message}</div>
    </div>
  );
}
