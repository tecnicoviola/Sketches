"use client";

import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Room {
  id: number;
  slug: string;
  createAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [inlineCode, setInlineCode] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);

  const isLimitReached = rooms.length >= 3;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchRooms(token);

    const handleRestore = () => {
      fetchRooms(token);
    };

    window.addEventListener("pageshow", handleRestore);
    window.addEventListener("popstate", handleRestore);
    window.addEventListener("focus", handleRestore);

    return () => {
      window.removeEventListener("pageshow", handleRestore);
      window.removeEventListener("popstate", handleRestore);
      window.removeEventListener("focus", handleRestore);
    };
  }, []);

  async function fetchRooms(token: string) {
    try {
      const res = await fetch(`${HTTP_BACKEND}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  }

  async function handleCreateRoom() {
    setError("");
    if (isLimitReached) {
      setError("Room limit reached — delete a room to create a new one.");
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to create room.");
        return;
      }
      const data = await res.json();
      setInlineCode(data.code);
      if (token) fetchRooms(token);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinRoom() {
    setError("");
    const code = joinRoomCode.trim();
    if (!code) { setError("Please enter a room code."); return; }
    setJoining(true);
    try {
      const res = await fetch(`${HTTP_BACKEND}/room/${code}`, {
        mode: "cors",
      });
      const data = await res.json();
      if (!data.room) {
        setError("Room not found. Check the room code and try again.");
        return;
      }
      router.push(`/canvas/${data.room.slug}`);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setJoining(false);
    }
  }

  async function handleDeleteRoom(code: string) {
    setError("");
    setDeletingCode(code);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${HTTP_BACKEND}/room/${code}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to delete room.");
        return;
      }
      setRooms((prev) => prev.filter((r) => r.slug.toLowerCase() !== code.toLowerCase()));
      if (inlineCode.toLowerCase() === code.toLowerCase()) {
        setInlineCode("");
      }
      setConfirmDeleteCode(null);
    } catch (err) {
      setError("Failed to delete room.");
    } finally {
      setDeletingCode(null);
    }
  }

  function handleSignout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/signin");
  }

  async function handleCopyInlineCode() {
    if (!inlineCode) return;
    try {
      await navigator.clipboard.writeText(inlineCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleShareInline() {
    if (!inlineCode) return;
    const shareUrl = `${window.location.origin}/canvas/${inlineCode}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Sketches Canvas`,
          text: `Join my canvas room with code ${inlineCode}`,
          url: shareUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.error("Failed to copy share link:", err);
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#02122F",
      color: "#F0ECDD",
      fontFamily: "'Jost', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 48px;
          border-bottom: 1px solid rgba(240,236,221,0.08);
        }

        .dash-wordmark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(240,236,221,0.6);
        }

        .dash-signout {
          background: transparent;
          border: 1px solid rgba(240,236,221,0.2);
          color: rgba(240,236,221,0.5);
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 8px 20px;
          cursor: pointer;
          border-radius: 1px;
          transition: all 0.2s;
        }
        .dash-signout:hover {
          border-color: rgba(240,236,221,0.4);
          color: rgba(240,236,221,0.8);
          background: rgba(240,236,221,0.05);
        }

        .dash-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 72px 48px;
        }

        .dash-hero {
          margin-bottom: 64px;
        }

        .dash-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .dash-hero h1 em {
          font-style: italic;
          font-weight: 400;
        }

        .dash-hero p {
          font-size: 13.5px;
          font-weight: 400;
          color: rgba(240,236,221,0.7);
          letter-spacing: 0.2px;
        }

        .dash-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 56px;
        }

        @media (max-width: 600px) {
          .dash-actions { grid-template-columns: 1fr; }
          .dash-nav { padding: 20px 24px; }
          .dash-body { padding: 48px 24px; }
        }

        .dash-card {
          background: rgba(240,236,221,0.03);
          border: 1px solid rgba(240,236,221,0.08);
          border-radius: 2px;
          padding: 32px;
          transition: border-color 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dash-card:hover { border-color: rgba(240,236,221,0.14); }

        .dash-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
        }
        .dash-card-title em { font-style: italic; }

        .dash-card-sub {
          font-size: 12px;
          font-weight: 400;
          color: rgba(240,236,221,0.65);
          margin-bottom: 24px;
          letter-spacing: 0.1px;
        }

        .dash-display-box {
          width: 100%;
          min-height: 42px;
          background: transparent;
          border-bottom: 1px solid rgba(240,236,221,0.15);
          padding: 6px 0 8px;
          color: #F0ECDD;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dash-inline-code {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 4px;
          font-variant-numeric: lining-nums tabular-nums;
          font-feature-settings: "lnum" 1, "tnum" 1;
          color: #F0ECDD;
          line-height: 1;
        }

        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }

        .dash-skeleton {
          width: 110px;
          height: 26px;
          background: rgba(240,236,221,0.12);
          border-radius: 2px;
          animation: shimmer 1.2s infinite ease-in-out;
        }

        .dash-inline-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dash-icon-btn {
          background: transparent;
          border: 1px solid rgba(240,236,221,0.18);
          color: rgba(240,236,221,0.7);
          padding: 6px;
          border-radius: 2px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }
        .dash-icon-btn:hover {
          background: rgba(240,236,221,0.08);
          border-color: rgba(240,236,221,0.4);
          color: #F0ECDD;
        }

        .dash-icon-label {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(2,18,47,0.9);
          border: 1px solid rgba(240,236,221,0.2);
          color: #F0ECDD;
          padding: 2px 6px;
          border-radius: 2px;
          white-space: nowrap;
          pointer-events: none;
        }

        .dash-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(240,236,221,0.15);
          padding: 6px 0 8px;
          color: #F0ECDD;
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 16px;
          letter-spacing: 3px;
          min-height: 42px;
          font-variant-numeric: lining-nums tabular-nums;
          font-feature-settings: "lnum" 1, "tnum" 1;
        }
        .dash-input::placeholder {
          color: rgba(240,236,221,0.45);
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 2px;
        }
        .dash-input:focus { border-bottom-color: rgba(240,236,221,0.5); }

        .dash-btn {
          width: 100%;
          padding: 13px 20px;
          background: #F0ECDD;
          color: #02122F;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          border-radius: 1px;
          transition: all 0.2s;
        }
        .dash-btn:hover:not(:disabled) {
          background: rgba(240,236,221,0.88);
          transform: translateY(-1px);
        }
        .dash-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .dash-btn-outline {
          background: transparent;
          color: #F0ECDD;
          border: 1px solid rgba(240,236,221,0.25);
        }
        .dash-btn-outline:hover:not(:disabled) {
          background: rgba(240,236,221,0.06);
          border-color: rgba(240,236,221,0.4);
          transform: translateY(-1px);
        }

        .dash-limit-note {
          font-size: 11px;
          font-weight: 400;
          color: rgba(240,236,221,0.7);
          margin-top: 10px;
          letter-spacing: 0.1px;
        }

        .dash-error {
          font-size: 12px;
          color: #c97b6e;
          margin-bottom: 16px;
          letter-spacing: 0.1px;
        }

        .dash-section-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: rgba(240,236,221,0.55);
          margin-bottom: 20px;
        }

        .dash-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 56px;
        }

        /* Fixed room card height preventing layout shift */
        .dash-room-item {
          position: relative;
          background: rgba(240,236,221,0.03);
          border: 1px solid rgba(240,236,221,0.08);
          border-radius: 2px;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 124px;
          min-height: 124px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dash-room-item:hover {
          border-color: rgba(240,236,221,0.2);
          background: rgba(240,236,221,0.05);
          transform: translateY(-1px);
        }

        .dash-trash-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: none;
          color: rgba(240,236,221,0.3);
          opacity: 0;
          cursor: pointer;
          padding: 4px;
          border-radius: 2px;
          transition: all 0.2s;
        }
        .dash-room-item:hover .dash-trash-btn {
          opacity: 1;
        }
        .dash-trash-btn:hover {
          color: #c97b6e;
          background: rgba(201,123,110,0.1);
        }

        .dash-room-bottom-area {
          height: 28px;
          display: flex;
          align-items: center;
        }

        .dash-delete-confirm {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #c97b6e;
          background: rgba(201,123,110,0.08);
          border: 1px solid rgba(201,123,110,0.2);
          padding: 4px 8px;
          border-radius: 2px;
        }

        .dash-delete-actions {
          display: flex;
          gap: 6px;
        }

        .dash-delete-btn-yes {
          background: #c97b6e;
          color: #02122F;
          border: none;
          padding: 2px 7px;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 1px;
        }

        .dash-delete-btn-no {
          background: transparent;
          color: rgba(240,236,221,0.6);
          border: 1px solid rgba(240,236,221,0.2);
          padding: 2px 7px;
          font-size: 10px;
          cursor: pointer;
          border-radius: 1px;
        }

        .dash-room-code-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 400;
          letter-spacing: 3px;
          font-variant-numeric: lining-nums tabular-nums;
          font-feature-settings: "lnum" 1, "tnum" 1;
          color: #F0ECDD;
        }

        .dash-room-meta {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dash-room-date {
          font-size: 11px;
          font-weight: 400;
          color: rgba(240,236,221,0.5);
        }

        .dash-empty {
          text-align: center;
          padding: 56px 32px;
          border: 1px dashed rgba(240,236,221,0.08);
          border-radius: 2px;
        }
        .dash-empty p {
          font-size: 13px;
          font-weight: 400;
          color: rgba(240,236,221,0.6);
          letter-spacing: 0.2px;
        }
      `}</style>

      {/* Navbar */}
      <nav className="dash-nav">
        <span className="dash-wordmark">Sketches</span>
        <button className="dash-signout" onClick={handleSignout}>Sign Out</button>
      </nav>

      {/* Body */}
      <div className="dash-body">

        {/* Hero */}
        <div className="dash-hero">
          <h1>Your <em>canvas</em> awaits.</h1>
          <p>Create a new room or join an existing one to start sketching.</p>
        </div>

        {/* Error */}
        {error && <p className="dash-error">{error}</p>}

        {/* Action Cards */}
        <div className="dash-actions">

          {/* Create Room */}
          <div className="dash-card">
            <div>
              <div className="dash-card-title"><em>Create</em> a room</div>
              <div className="dash-card-sub">Generate a new collaborative canvas.</div>
              
              <div className="dash-display-box">
                {creating ? (
                  <div className="dash-skeleton" />
                ) : inlineCode ? (
                  <>
                    <span className="dash-inline-code">{inlineCode}</span>
                    <div className="dash-inline-actions">
                      {/* Share Icon Button */}
                      <button
                        className="dash-icon-btn"
                        title="Share Room"
                        onClick={handleShareInline}
                      >
                        {shared && <span className="dash-icon-label">Shared!</span>}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      </button>

                      {/* Copy Code Icon Button */}
                      <button
                        className="dash-icon-btn"
                        title="Copy Code"
                        onClick={handleCopyInlineCode}
                      >
                        {copied && <span className="dash-icon-label">Copied!</span>}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>

                      {/* Enter Room Icon Button */}
                      <button
                        className="dash-icon-btn"
                        title="Enter Room"
                        onClick={() => router.push(`/canvas/${inlineCode}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "rgba(240,236,221,0.2)" }}>Click below to generate code</span>
                )}
              </div>
            </div>

            <div>
              <button
                className="dash-btn"
                onClick={handleCreateRoom}
                disabled={creating || isLimitReached}
              >
                {creating ? "Creating…" : "Create Room"}
              </button>

              {isLimitReached && (
                <div className="dash-limit-note">
                  Delete a room to create another.
                </div>
              )}
            </div>
          </div>

          {/* Join Room */}
          <div className="dash-card">
            <div>
              <div className="dash-card-title"><em>Join</em> a room</div>
              <div className="dash-card-sub">Enter a 5-character room code.</div>
              <input
                className="dash-input"
                type="text"
                placeholder="Room code (e.g. A3k9F)"
                value={joinRoomCode}
                onChange={e => { setJoinRoomCode(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleJoinRoom()}
              />
            </div>
            <button className="dash-btn dash-btn-outline" onClick={handleJoinRoom} disabled={joining}>
              {joining ? "Joining…" : "Join Room"}
            </button>
          </div>

        </div>

        {/* Rooms list */}
        <div className="dash-section-label">Your Rooms</div>

        {rooms.length > 0 ? (
          <div className="dash-rooms-grid">
            {rooms.map(room => (
              <div
                key={room.id}
                className="dash-room-item"
                onClick={() => router.push(`/canvas/${room.slug}`)}
              >
                {/* Trash Icon Button */}
                <button
                  className="dash-trash-btn"
                  title="Delete Room"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteCode(confirmDeleteCode === room.slug ? null : room.slug);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>

                <div>
                  <div className="dash-room-code-title">{room.slug}</div>
                </div>

                <div className="dash-room-bottom-area" onClick={(e) => e.stopPropagation()}>
                  {confirmDeleteCode === room.slug ? (
                    <div className="dash-delete-confirm">
                      <span>Delete room?</span>
                      <div className="dash-delete-actions">
                        <button
                          className="dash-delete-btn-yes"
                          disabled={deletingCode === room.slug}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.slug);
                          }}
                        >
                          {deletingCode === room.slug ? "..." : "Confirm"}
                        </button>
                        <button
                          className="dash-delete-btn-no"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteCode(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="dash-room-meta">
                      <span className="dash-room-date">
                        {room.createAt ? new Date(room.createAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <p>No rooms yet — create one above to get started.</p>
          </div>
        )}

      </div>
    </div>
  );
}