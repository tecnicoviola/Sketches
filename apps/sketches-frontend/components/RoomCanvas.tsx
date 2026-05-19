"use client";

import { WS_URL } from "../config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    // read token from localStorage not hardcoded
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      console.log("Joined room:", data);
      ws.send(data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  if (!socket) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#02122F",
        color: "#F0ECDD",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Jost', sans-serif",
        fontSize: "14px",
        fontWeight: 300,
        letterSpacing: "0.2px",
      }}>
        Connecting to canvas...
      </div>
    );
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}