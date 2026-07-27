import { RoomCanvas } from "@/components/RoomCanvas";
import { HTTP_BACKEND } from "@/config";
import Link from "next/link";

async function getRoomIdByCode(code: string): Promise<number | null> {
  try {
    const res = await fetch(`${HTTP_BACKEND}/room/${code.toUpperCase()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.room ? data.room.id : null;
  } catch (err) {
    return null;
  }
}

export default async function CanvasPage({
  params,
}: {
  params: {
    code: string;
  };
}) {
  const code = (await params).code;
  const roomId = await getRoomIdByCode(code);

  if (!roomId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#02122F",
          color: "#F0ECDD",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Jost', sans-serif",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        `}</style>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "42px",
            fontWeight: 300,
            marginBottom: "16px",
            letterSpacing: "-0.5px",
          }}
        >
          Room not found
        </h1>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 300,
            color: "rgba(240,236,221,0.5)",
            marginBottom: "32px",
            maxWidth: "360px",
          }}
        >
          The room code <span style={{ color: "#F0ECDD", fontWeight: 500, fontVariantNumeric: "lining-nums tabular-nums" }}>{code.toUpperCase()}</span> does not exist or may have been deleted.
        </p>
        <Link
          href="/dashboard"
          style={{
            padding: "12px 28px",
            background: "#F0ECDD",
            color: "#02122F",
            fontFamily: "'Jost', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "3px",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "1px",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <RoomCanvas roomId={roomId.toString()} roomCode={code.toUpperCase()} />;
}