// import { useEffect, useRef, useState } from "react";
// import { IconButton } from "../components/IconButton";
// import { Circle, Pencil, RectangleHorizontalIcon, Minus, Eraser, Undo2, Redo2, Hand } from "lucide-react";
// import { Game } from "../draw/Game";

// export type Tool = "circle" | "rect" | "pencil" | "line" | "eraser" | "pan";

// const COLORS = ["#ffffff", "#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"];
// const WIDTHS = [1, 3, 6];

// export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [game, setGame] = useState<Game>();
//   const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
//   const [selectedColor, setSelectedColor] = useState("#ffffff");
//   const [selectedWidth, setSelectedWidth] = useState(2);

//   useEffect(() => {
//     game?.setTool(selectedTool);
//   }, [selectedTool, game]);

//   useEffect(() => {
//     game?.setColor(selectedColor);
//   }, [selectedColor, game]);

//   useEffect(() => {
//     game?.setLineWidth(selectedWidth);
//   }, [selectedWidth, game]);

//   useEffect(() => {
//     if (canvasRef.current) {
//       const g = new Game(canvasRef.current, roomId, socket);
//       setGame(g);
//       return () => { g.destroy(); };
//     }
//   }, [canvasRef]);

//   return (
//     <div style={{ height: "100vh", overflow: "hidden", background: "#000" }}>
//       <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />

//       {/* Top toolbar */}
//       <div style={{
//         position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
//         display: "flex", gap: 6, background: "#1a1a2e",
//         border: "1px solid rgba(255,255,255,0.1)",
//         borderRadius: 12, padding: "8px 12px",
//       }}>
//         <IconButton onClick={() => setSelectedTool("pencil")} activated={selectedTool === "pencil"} icon={<Pencil size={18} />} />
//         <IconButton onClick={() => setSelectedTool("rect")} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon size={18} />} />
//         <IconButton onClick={() => setSelectedTool("circle")} activated={selectedTool === "circle"} icon={<Circle size={18} />} />
//         <IconButton onClick={() => setSelectedTool("line")} activated={selectedTool === "line"} icon={<Minus size={18} />} />
//         <IconButton onClick={() => setSelectedTool("eraser")} activated={selectedTool === "eraser"} icon={<Eraser size={18} />} />
//         <IconButton onClick={() => setSelectedTool("pan")} activated={selectedTool === "pan"} icon={<Hand size={18} />} />
//         <div style={{ width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
//         <IconButton onClick={() => game?.undo()} activated={false} icon={<Undo2 size={18} />} />
//         <IconButton onClick={() => game?.redo()} activated={false} icon={<Redo2 size={18} />} />
//       </div>

//       {/* Left panel — color + stroke */}
//       <div style={{
//         position: "fixed", top: "50%", left: 12, transform: "translateY(-50%)",
//         background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
//         borderRadius: 12, padding: 12,
//         display: "flex", flexDirection: "column", gap: 10,
//       }}>
//         {/* Colors */}
//         <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Color</div>
//         {COLORS.map(c => (
//           <div key={c} onClick={() => setSelectedColor(c)} style={{
//             width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
//             border: selectedColor === c ? "2px solid white" : "2px solid transparent",
//             boxSizing: "border-box",
//           }} />
//         ))}

//         {/* Custom color */}
//         <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}
//           style={{ width: 24, height: 24, border: "none", borderRadius: "50%", cursor: "pointer", padding: 0, background: "none" }} />

//         {/* Stroke width */}
//         <div style={{ width: 1, height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
//         <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Width</div>
//         {WIDTHS.map(w => (
//           <div key={w} onClick={() => setSelectedWidth(w)} style={{
//             width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
//             borderRadius: 6, background: selectedWidth === w ? "rgba(255,255,255,0.15)" : "transparent",
//           }}>
//             <div style={{ width: 16, height: w, background: "white", borderRadius: 2 }} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { IconButton } from "../components/IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, Minus, Eraser, Undo2, Redo2, Hand, Wand2 } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "line" | "eraser" | "pan";

const COLORS = ["#ffffff", "#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"];
const WIDTHS = [1, 3, 6];

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
}

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [aiLoading, setAiLoading] = useState(false);
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => { game?.setTool(selectedTool); }, [selectedTool, game]);
  useEffect(() => { game?.setColor(selectedColor); }, [selectedColor, game]);
  useEffect(() => { game?.setLineWidth(selectedWidth); }, [selectedWidth, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      g.onCursorsUpdate = (updatedCursors) => setCursors(updatedCursors);
      setGame(g);
      return () => { g.destroy(); };
    }
  }, [canvasRef]);

  async function handleAI() {
    setAiLoading(true);
    await game?.recognizeShape();
    setAiLoading(false);
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#000", position: "relative" }}>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />

      {/* Remote cursor name tags */}
      {cursors.map((cursor) => (
        <div key={cursor.userId} style={{
          position: "fixed",
          left: cursor.x + 16,
          top: cursor.y - 4,
          background: cursor.color,
          color: "#000",
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 4,
          pointerEvents: "none",
          zIndex: 100,
          fontFamily: "sans-serif",
        }}>
          {cursor.userId.slice(0, 8)}
        </div>
      ))}

      {/* Top toolbar */}
      <div style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: "8px 12px",
        zIndex: 50,
      }}>
        <IconButton onClick={() => setSelectedTool("pencil")} activated={selectedTool === "pencil"} icon={<Pencil size={18} />} />
        <IconButton onClick={() => setSelectedTool("rect")} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon size={18} />} />
        <IconButton onClick={() => setSelectedTool("circle")} activated={selectedTool === "circle"} icon={<Circle size={18} />} />
        <IconButton onClick={() => setSelectedTool("line")} activated={selectedTool === "line"} icon={<Minus size={18} />} />
        <IconButton onClick={() => setSelectedTool("eraser")} activated={selectedTool === "eraser"} icon={<Eraser size={18} />} />
        <IconButton onClick={() => setSelectedTool("pan")} activated={selectedTool === "pan"} icon={<Hand size={18} />} />
        <div style={{ width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
        <IconButton onClick={() => game?.undo()} activated={false} icon={<Undo2 size={18} />} />
        <IconButton onClick={() => game?.redo()} activated={false} icon={<Redo2 size={18} />} />
        <div style={{ width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
        {/* AI button */}
        <button onClick={handleAI} disabled={aiLoading} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px",
          background: aiLoading ? "rgba(167,139,250,0.3)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: aiLoading ? "not-allowed" : "pointer",
          letterSpacing: "0.3px",
        }}>
          <Wand2 size={14} />
          {aiLoading ? "Recognizing…" : "AI Shape"}
        </button>
      </div>

      {/* Left panel — color + stroke width */}
      <div style={{
        position: "fixed", top: "50%", left: 12, transform: "translateY(-50%)",
        background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, padding: 12,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 50,
      }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Color</div>
        {COLORS.map(c => (
          <div key={c} onClick={() => setSelectedColor(c)} style={{
            width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
            border: selectedColor === c ? "2px solid white" : "2px solid transparent",
            boxSizing: "border-box",
          }} />
        ))}
        <input
          type="color"
          value={selectedColor}
          onChange={e => setSelectedColor(e.target.value)}
          style={{ width: 24, height: 24, border: "none", borderRadius: "50%", cursor: "pointer", padding: 0, background: "none" }}
        />

        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>Width</div>
        {WIDTHS.map(w => (
          <div key={w} onClick={() => setSelectedWidth(w)} style={{
            width: 24, height: 24, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            borderRadius: 6, background: selectedWidth === w ? "rgba(255,255,255,0.15)" : "transparent",
          }}>
            <div style={{ width: 16, height: w, background: "white", borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}