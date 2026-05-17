"use client";

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
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomName, setJoinRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchRooms(token);
  }, []);

  async function fetchRooms(token: string) {
    // fetch rooms if you have a /rooms endpoint, for now we leave empty
    // you can add this later
  }

  async function handleCreateRoom() {
    setError("");
    if (!newRoomName.trim()) { setError("Please enter a room name."); return; }
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3004/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        mode: "cors",
        body: JSON.stringify({ name: newRoomName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to create room.");
        return;
      }
      const data = await res.json();
      router.push(`/canvas/${data.roomId}`);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinRoom() {
    setError("");
    if (!joinRoomName.trim()) { setError("Please enter a room name."); return; }
    setJoining(true);
    try {
      const res = await fetch(`http://localhost:3004/room/${joinRoomName.trim()}`, {
        mode: "cors",
      });
      const data = await res.json();
      if (!data.room) {
        setError("Room not found.");
        return;
      }
      router.push(`/canvas/${data.room.id}`);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setJoining(false);
    }
  }

  function handleSignout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/signin");
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
          font-weight: 300;
          color: rgba(240,236,221,0.4);
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
          font-weight: 300;
          color: rgba(240,236,221,0.35);
          margin-bottom: 24px;
          letter-spacing: 0.1px;
        }

        .dash-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(240,236,221,0.15);
          padding: 8px 0 10px;
          color: #F0ECDD;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 20px;
          letter-spacing: 0.2px;
        }
        .dash-input::placeholder { color: rgba(240,236,221,0.2); }
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
          color: rgba(240,236,221,0.25);
          margin-bottom: 20px;
        }

        .dash-empty {
          text-align: center;
          padding: 56px 32px;
          border: 1px dashed rgba(240,236,221,0.08);
          border-radius: 2px;
        }
        .dash-empty p {
          font-size: 13px;
          font-weight: 300;
          color: rgba(240,236,221,0.25);
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
            <div className="dash-card-title"><em>Create</em> a room</div>
            <div className="dash-card-sub">Start a new collaborative canvas.</div>
            <input
              className="dash-input"
              type="text"
              placeholder="Room name"
              value={newRoomName}
              onChange={e => { setNewRoomName(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleCreateRoom()}
            />
            <button className="dash-btn" onClick={handleCreateRoom} disabled={creating}>
              {creating ? "Creating…" : "Create Room"}
            </button>
          </div>

          {/* Join Room */}
          <div className="dash-card">
            <div className="dash-card-title"><em>Join</em> a room</div>
            <div className="dash-card-sub">Enter a room name to collaborate.</div>
            <input
              className="dash-input"
              type="text"
              placeholder="Room name"
              value={joinRoomName}
              onChange={e => { setJoinRoomName(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleJoinRoom()}
            />
            <button className="dash-btn dash-btn-outline" onClick={handleJoinRoom} disabled={joining}>
              {joining ? "Joining…" : "Join Room"}
            </button>
          </div>

        </div>

        {/* Rooms list — empty state for now */}
        <div className="dash-section-label">Your Rooms</div>
        <div className="dash-empty">
          <p>No rooms yet — create one above to get started.</p>
        </div>

      </div>
    </div>
  );
}