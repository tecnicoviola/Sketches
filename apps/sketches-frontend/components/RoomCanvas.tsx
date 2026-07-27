"use client";

import { WS_URL } from "../config";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";

type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function RoomCanvas({ roomId, roomCode }: { roomId: string; roomCode?: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const router = useRouter();
  const isUnmounting = useRef(false);
  const retryCount = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  function connect() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      if (isUnmounting.current) {
        ws.close();
        return;
      }
      retryCount.current = 0;
      setSocket(ws);
      setStatus("connected");

      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      ws.send(data);
    };

    ws.onerror = () => {
      // Suppress unmount errors in development double-mount
      if (isUnmounting.current) return;
      if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) return;
    };

    ws.onclose = (event) => {
      if (isUnmounting.current) return;
      setSocket(null);

      // Explicit invalid token close from server
      if (event.code === 1008) {
        setStatus("disconnected");
        router.push("/signin");
        return;
      }

      if (retryCount.current < 5) {
        setStatus("reconnecting");
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 8000);
        retryCount.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      } else {
        setStatus("disconnected");
      }
    };
  }

  useEffect(() => {
    isUnmounting.current = false;
    connect();

    return () => {
      isUnmounting.current = true;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      setSocket((prev) => {
        if (prev) {
          prev.close();
        }
        return null;
      });
    };
  }, [roomId]);

  if (!socket && status === "connecting") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#02122F",
          color: "#F0ECDD",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Jost', sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "0.2px",
        }}
      >
        Connecting to canvas...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* User-facing reconnection / status banner */}
      {status === "reconnecting" && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(2, 18, 47, 0.92)",
            border: "1px solid rgba(240, 236, 221, 0.2)",
            color: "#F0ECDD",
            padding: "8px 20px",
            borderRadius: "2px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "0.5px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#c97b6e",
              display: "inline-block",
            }}
          />
          Connection lost, retrying...
        </div>
      )}

      {status === "disconnected" && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(2, 18, 47, 0.95)",
            border: "1px solid rgba(201, 123, 110, 0.4)",
            color: "#F0ECDD",
            padding: "10px 24px",
            borderRadius: "2px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span>Disconnected from server</span>
          <button
            onClick={() => {
              retryCount.current = 0;
              setStatus("connecting");
              connect();
            }}
            style={{
              background: "#F0ECDD",
              color: "#02122F",
              border: "none",
              padding: "4px 12px",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "1px",
            }}
          >
            Reconnect
          </button>
        </div>
      )}

      {socket && <Canvas roomId={roomId} roomCode={roomCode || roomId} socket={socket} />}
    </div>
  );
}