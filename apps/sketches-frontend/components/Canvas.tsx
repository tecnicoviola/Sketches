// "use client";
// import { RightSidebar } from "../components/RightSidebar";
// import { Library } from "lucide-react"; // Let's grab a clean library icon
// import { useEffect, useRef, useState } from "react";
// import { IconButton } from "../components/IconButton";
// import { HamburgerMenu } from "../components/HamBurger";
// import { AIPanel } from "../components/AIPanel";
// import {
//   Pencil, RectangleHorizontalIcon, Circle, Minus, Eraser,
//   Undo2, Redo2, Hand, Wand2, MousePointer2, Type,
//   Diamond, ArrowRight, Lock, Unlock, MoreHorizontal,
//   Lasso, Crosshair, Star,
//   Image as ImageIcon, // renamed to avoid conflict with browser Image constructor
// } from "lucide-react";
// import { Game } from "../draw/Game";

// export type Tool =
//   | "select" | "rect" | "diamond" | "circle" | "star"
//   | "pencil" | "line" | "arrow" | "text" | "image"
//   | "eraser" | "pan" | "laser" | "frame" | "lasso";

// const COLORS = ["#ffffff", "#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"];
// const WIDTHS = [1, 3, 6];

// interface RemoteCursor {
//   userId: string;
//   x: number;
//   y: number;
//   color: string;
// }

// const MAIN_TOOLS: { tool: Tool; icon: any; label: string; shortcut: string }[] = [
//   { tool: "select",  icon: MousePointer2,          label: "Select",    shortcut: "S" },
//   { tool: "rect",    icon: RectangleHorizontalIcon, label: "Rectangle", shortcut: "R" },
//   { tool: "diamond", icon: Diamond,                 label: "Diamond",   shortcut: "D" },
//   { tool: "circle",  icon: Circle,                  label: "Circle",    shortcut: "C" },
//   { tool: "star",    icon: Star,                    label: "Star",      shortcut: "" },
//   { tool: "pencil",  icon: Pencil,                  label: "Pencil",    shortcut: "P" },
//   { tool: "line",    icon: Minus,                   label: "Line",      shortcut: "L" },
//   { tool: "arrow",   icon: ArrowRight,              label: "Arrow",     shortcut: "A" },
//   { tool: "text",    icon: Type,                    label: "Text",      shortcut: "T" },   // ✅ Type icon
//   { tool: "image",   icon: ImageIcon,               label: "Image",     shortcut: "I" },   // ✅ ImageIcon
//   { tool: "eraser",  icon: Eraser,                  label: "Eraser",    shortcut: "E" },
// ];

// const MORE_TOOLS: { tool: Tool; icon: any; label: string }[] = [
//   { tool: "lasso",  icon: Lasso,     label: "Lasso Select" },
//   { tool: "laser",  icon: Crosshair, label: "Laser Pointer" },
// ];

// export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [game, setGame] = useState<Game>();
//   const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
//   const [selectedColor, setSelectedColor] = useState("#ffffff");
//   const [selectedWidth, setSelectedWidth] = useState(2);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [cursors, setCursors] = useState<RemoteCursor[]>([]);
//   const [locked, setLocked] = useState(false);
//   const [showMore, setShowMore] = useState(false);
//   const [canvasBackground, setCanvasBackground] = useState("#1b1b1f");
//   const [showAIPanel, setShowAIPanel] = useState(false);
//   const [showGrid, setShowGrid] = useState(false);

//   useEffect(() => { game?.setTool(selectedTool); }, [selectedTool, game]);
//   useEffect(() => { game?.setColor(selectedColor); }, [selectedColor, game]);
//   useEffect(() => { game?.setLineWidth(selectedWidth); }, [selectedWidth, game]);
//   useEffect(() => { game?.setLocked(locked); }, [locked, game]);
//   useEffect(() => { game?.setShowGrid(showGrid); }, [showGrid, game]);

//   useEffect(() => {
//     if (canvasRef.current) {
//       const g = new Game(canvasRef.current, roomId, socket);
//       g.onCursorsUpdate = (c) => setCursors(c);
//       g.onToolChange = (t) => { if (!locked) setSelectedTool(t as Tool); };
//       setGame(g);
//       return () => { g.destroy(); };
//     }
//   }, [canvasRef]);

//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
//       const key = e.key.toLowerCase();
//       const map: Record<string, Tool> = {
//         s: "select", r: "rect", d: "diamond", c: "circle",
//         p: "pencil", l: "line", a: "arrow", t: "text",
//         i: "image", e: "eraser", h: "pan",
//         "1": "select", "2": "rect", "3": "diamond", "4": "circle",
//         "5": "pencil", "6": "line", "7": "arrow", "8": "text", "9": "eraser",
//       };
//       if (map[key]) setSelectedTool(map[key]!);
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, []);

//   async function handleAI() {
//     setAiLoading(true);
//     await game?.recognizeShape();
//     setAiLoading(false);
//   }

//   function handleResetCanvas() { game?.resetCanvas(); }

//   function handleChangeBackground(color: string) {
//     setCanvasBackground(color);
//     game?.setBackground(color);
//   }

//   function handleToggleGrid(show: boolean) {
//     setShowGrid(show);
//     game?.setShowGrid(show);
//   }

//   function handleFindText(query: string): { found: boolean; matchCount: number } {
//     if (!game) return { found: false, matchCount: 0 };
//     return game.findText(query);
//   }

//   function handleInsertShapes(shapes: any[]) {
//     shapes.forEach(shape => game?.insertShape(shape));
//   }

//   function pickTool(tool: Tool) {
//     setSelectedTool(tool);
//     setShowMore(false);
//   }

//   return (
//     <div style={{ height: "100vh", overflow: "hidden", background: canvasBackground, position: "relative" }}>
//       <style>{`
//         .toolbar {
//           position: fixed;
//           top: 12px;
//           left: 50%;
//           transform: translateX(-50%);
//           display: flex;
//           align-items: center;
//           gap: 2px;
//           background: #2c2c32;
//           border: 1px solid rgba(255,255,255,0.08);
//           border-radius: 10px;
//           padding: 6px 8px;
//           z-index: 50;
//           box-shadow: 0 4px 24px rgba(0,0,0,0.4);
//         }
//         .toolbar-sep {
//           width: 1px;
//           height: 24px;
//           background: rgba(255,255,255,0.1);
//           margin: 0 4px;
//         }
//         .more-menu {
//           position: absolute;
//           top: calc(100% + 8px);
//           left: 50%;
//           transform: translateX(-50%);
//           background: #2c2c32;
//           border: 1px solid rgba(255,255,255,0.1);
//           border-radius: 8px;
//           padding: 6px;
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//           z-index: 100;
//           min-width: 180px;
//           box-shadow: 0 8px 32px rgba(0,0,0,0.5);
//         }
//         .more-item {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 8px 12px;
//           border-radius: 6px;
//           cursor: pointer;
//           color: rgba(255,255,255,0.75);
//           font-size: 13px;
//           font-family: sans-serif;
//           transition: background 0.15s;
//         }
//         .more-item:hover { background: rgba(255,255,255,0.08); }
//         .side-panel {
//           position: fixed;
//           top: 50%;
//           left: 12px;
//           transform: translateY(-50%);
//           background: #2c2c32;
//           border: 1px solid rgba(255,255,255,0.08);
//           border-radius: 10px;
//           padding: 10px;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//           z-index: 50;
//           box-shadow: 0 4px 24px rgba(0,0,0,0.4);
//         }
//         .panel-label {
//           font-size: 9px;
//           font-weight: 500;
//           letter-spacing: 2px;
//           text-transform: uppercase;
//           color: rgba(255,255,255,0.25);
//           text-align: center;
//         }
//         .panel-sep { height: 1px; background: rgba(255,255,255,0.08); }
//         .color-dot {
//           width: 22px;
//           height: 22px;
//           border-radius: 50%;
//           cursor: pointer;
//           transition: transform 0.15s;
//           box-sizing: border-box;
//         }
//         .color-dot:hover { transform: scale(1.15); }
//         .width-btn {
//           width: 32px;
//           height: 28px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border-radius: 6px;
//           cursor: pointer;
//           transition: background 0.15s;
//         }
//         .width-btn:hover { background: rgba(255,255,255,0.08); }
//         .ai-shape-btn {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 6px 10px;
//           background: rgba(124,58,237,0.2);
//           color: #a78bfa;
//           border: 1px solid rgba(124,58,237,0.3);
//           border-radius: 7px;
//           font-size: 12px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s;
//         }
//         .ai-shape-btn:hover:not(:disabled) {
//           background: rgba(124,58,237,0.3);
//           transform: translateY(-1px);
//         }
//         .ai-shape-btn:disabled { opacity: 0.5; cursor: not-allowed; }
//         .generate-btn {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 6px 12px;
//           background: linear-gradient(135deg, #6d28d9, #9333ea);
//           color: #fff;
//           border: none;
//           border-radius: 7px;
//           font-size: 12px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s;
//           box-shadow: 0 2px 12px rgba(124,58,237,0.4);
//         }
//         .generate-btn:hover {
//           background: linear-gradient(135deg, #7c3aed, #a855f7);
//           transform: translateY(-1px);
//         }
//         .generate-btn.active {
//           background: rgba(167,139,250,0.2);
//           border: 1px solid rgba(167,139,250,0.4);
//           color: #a78bfa;
//           box-shadow: none;
//         }
//       `}</style>

//       <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />

//       <HamburgerMenu
//         onResetCanvas={handleResetCanvas}
//         onExportImage={() => {}}
//         onChangeBackground={handleChangeBackground}
//         canvasBackground={canvasBackground}
//         canvasRef={canvasRef}
//         onToggleGrid={handleToggleGrid}
//         showGrid={showGrid}
//         onFindText={handleFindText}
//       />

//       <AIPanel
//         open={showAIPanel}
//         onClose={() => setShowAIPanel(false)}
//         onInsertShapes={handleInsertShapes}
//         canvasRef={canvasRef}
//       />

//       {cursors.map((cursor) => (
//         <div key={cursor.userId} style={{
//           position: "fixed",
//           left: cursor.x + 16,
//           top: cursor.y - 4,
//           background: cursor.color,
//           color: "#000",
//           fontSize: 11,
//           fontWeight: 600,
//           padding: "2px 8px",
//           borderRadius: 4,
//           pointerEvents: "none",
//           zIndex: 100,
//           fontFamily: "sans-serif",
//         }}>
//           {cursor.userId.slice(0, 8)}
//         </div>
//       ))}

//       {/* Top toolbar */}
//       <div className="toolbar">
//         <IconButton
//           onClick={() => setLocked(l => !l)}
//           activated={locked}
//           icon={locked ? <Lock size={16} /> : <Unlock size={16} />}
//           label={locked ? "Unlock tool" : "Lock tool"}
//           shortcut="Q"
//         />
//         <div className="toolbar-sep" />
//         <IconButton
//           onClick={() => pickTool("pan")}
//           activated={selectedTool === "pan"}
//           icon={<Hand size={17} />}
//           label="Pan"
//           shortcut="H"
//         />
//         <div className="toolbar-sep" />

//         {MAIN_TOOLS.map(({ tool, icon: Icon, label, shortcut }) => (
//           <IconButton
//             key={tool}
//             onClick={() => pickTool(tool)}
//             activated={selectedTool === tool}
//             icon={<Icon size={17} />}
//             label={label}
//             shortcut={shortcut}
//           />
//         ))}

//         <div className="toolbar-sep" />
//         <IconButton onClick={() => game?.undo()} activated={false} icon={<Undo2 size={17} />} label="Undo" shortcut="Ctrl+Z" />
//         <IconButton onClick={() => game?.redo()} activated={false} icon={<Redo2 size={17} />} label="Redo" shortcut="Ctrl+Y" />
//         <div className="toolbar-sep" />

//         <button className="ai-shape-btn" onClick={handleAI} disabled={aiLoading}>
//           <Wand2 size={13} />
//           {aiLoading ? "…" : "AI Shape"}
//         </button>

//         <button
//           className={`generate-btn ${showAIPanel ? "active" : ""}`}
//           onClick={() => setShowAIPanel(p => !p)}
//         >
//           <Wand2 size={13} />
//           Generate
//         </button>

//         <div className="toolbar-sep" />
//         <div style={{ position: "relative" }}>
//           <IconButton
//             onClick={() => setShowMore(m => !m)}
//             activated={showMore}
//             icon={<MoreHorizontal size={17} />}
//             label="More tools"
//           />
//           {showMore && (
//             <div className="more-menu">
//               {MORE_TOOLS.map(({ tool, icon: Icon, label }) => (
//                 <div key={tool} className="more-item" onClick={() => pickTool(tool)}>
//                   <Icon size={15} />{label}
//                 </div>
//               ))}
//               <div className="more-item" onClick={() => { setShowAIPanel(true); setShowMore(false); }}>
//                 <Wand2 size={15} />Text to diagram
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Left panel */}
//       <div className="side-panel">
//         <div className="panel-label">Color</div>
//         {COLORS.map(c => (
//           <div key={c} className="color-dot" onClick={() => setSelectedColor(c)}
//             style={{ background: c, border: selectedColor === c ? "2px solid white" : "2px solid transparent" }}
//           />
//         ))}
//         <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}
//           style={{ width: 22, height: 22, border: "none", borderRadius: "50%", cursor: "pointer", padding: 0 }}
//         />
//         <div className="panel-sep" />
//         <div className="panel-label">Width</div>
//         {WIDTHS.map(w => (
//           <div key={w} className="width-btn" onClick={() => setSelectedWidth(w)}
//             style={{ background: selectedWidth === w ? "rgba(255,255,255,0.12)" : "transparent" }}
//           >
//             <div style={{ width: 18, height: w, background: "white", borderRadius: 2 }} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



"use client";

import { RightSidebar } from "../components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../components/IconButton";
import { HamburgerMenu } from "../components/HamBurger";
import { AIPanel } from "../components/AIPanel";
import {
  Pencil, RectangleHorizontalIcon, Circle, Minus, Eraser,
  Undo2, Redo2, Hand, Wand2, MousePointer2, Type,
  Diamond, ArrowRight, Lock, Unlock, MoreHorizontal,
  Lasso, Crosshair, Star, Library, // ✅ Added Library icon here
  Image as ImageIcon, // renamed to avoid conflict with browser Image constructor
} from "lucide-react";
import { Game } from "../draw/Game";

export type Tool =
  | "select" | "rect" | "diamond" | "circle" | "star"
  | "pencil" | "line" | "arrow" | "text" | "image"
  | "eraser" | "pan" | "laser" | "frame" | "lasso";

const COLORS = ["#ffffff", "#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"];
const WIDTHS = [1, 3, 6];

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
}

const MAIN_TOOLS: { tool: Tool; icon: any; label: string; shortcut: string }[] = [
  { tool: "select",  icon: MousePointer2,          label: "Select",    shortcut: "S" },
  { tool: "rect",    icon: RectangleHorizontalIcon, label: "Rectangle", shortcut: "R" },
  { tool: "diamond", icon: Diamond,                 label: "Diamond",   shortcut: "D" },
  { tool: "circle",  icon: Circle,                  label: "Circle",    shortcut: "C" },
  { tool: "star",    icon: Star,                    label: "Star",      shortcut: "" },
  { tool: "pencil",  icon: Pencil,                  label: "Pencil",    shortcut: "P" },
  { tool: "line",    icon: Minus,                   label: "Line",      shortcut: "L" },
  { tool: "arrow",   icon: ArrowRight,              label: "Arrow",     shortcut: "A" },
  { tool: "text",    icon: Type,                    label: "Text",      shortcut: "T" },
  { tool: "image",   icon: ImageIcon,               label: "Image",     shortcut: "I" },
  { tool: "eraser",  icon: Eraser,                  label: "Eraser",    shortcut: "E" },
];

const MORE_TOOLS: { tool: Tool; icon: any; label: string }[] = [
  { tool: "lasso",  icon: Lasso,     label: "Lasso Select" },
  { tool: "laser",  icon: Crosshair, label: "Laser Pointer" },
];

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [aiLoading, setAiLoading] = useState(false);
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);
  const [locked, setLocked] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState("#1b1b1f");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false); // ✅ Added right sidebar state

  useEffect(() => { game?.setTool(selectedTool); }, [selectedTool, game]);
  useEffect(() => { game?.setColor(selectedColor); }, [selectedColor, game]);
  useEffect(() => { game?.setLineWidth(selectedWidth); }, [selectedWidth, game]);
  useEffect(() => { game?.setLocked(locked); }, [locked, game]);
  useEffect(() => { game?.setShowGrid(showGrid); }, [showGrid, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      g.onCursorsUpdate = (c) => setCursors(c);
      g.onToolChange = (t) => { if (!locked) setSelectedTool(t as Tool); };
      setGame(g);
      return () => { g.destroy(); };
    }
  }, [canvasRef]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, Tool> = {
        s: "select", r: "rect", d: "diamond", c: "circle",
        p: "pencil", l: "line", a: "arrow", t: "text",
        i: "image", e: "eraser", h: "pan",
        "1": "select", "2": "rect", "3": "diamond", "4": "circle",
        "5": "pencil", "6": "line", "7": "arrow", "8": "text", "9": "eraser",
      };
      if (map[key]) setSelectedTool(map[key]!);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleAI() {
    setAiLoading(true);
    await game?.recognizeShape();
    setAiLoading(false);
  }

  function handleResetCanvas() { game?.resetCanvas(); }

  function handleChangeBackground(color: string) {
    setCanvasBackground(color);
    game?.setBackground(color);
  }

  function handleToggleGrid(show: boolean) {
    setShowGrid(show);
    game?.setShowGrid(show);
  }

  function handleFindText(query: string): { found: boolean; matchCount: number } {
    if (!game) return { found: false, matchCount: 0 };
    return game.findText(query);
  }

  function handleInsertShapes(shapes: any[]) {
    shapes.forEach(shape => game?.insertShape(shape));
  }

  function pickTool(tool: Tool) {
    setSelectedTool(tool);
    setShowMore(false);
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: canvasBackground, position: "relative" }}>
      <style>{`
        .toolbar {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 2px;
          background: #2c2c32;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 6px 8px;
          z-index: 50;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .toolbar-sep {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          margin: 0 4px;
        }
        .more-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #2c2c32;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 100;
          min-width: 180px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .more-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-family: sans-serif;
          transition: background 0.15s;
        }
        .more-item:hover { background: rgba(255,255,255,0.08); }
        .side-panel {
          position: fixed;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          background: #2c2c32;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 50;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .panel-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-align: center;
        }
        .panel-sep { height: 1px; background: rgba(255,255,255,0.08); }
        .color-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s;
          box-sizing: border-box;
        }
        .color-dot:hover { transform: scale(1.15); }
        .width-btn {
          width: 32px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .width-btn:hover { background: rgba(255,255,255,0.08); }
        .ai-shape-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(124,58,237,0.2);
          color: #a78bfa;
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ai-shape-btn:hover:not(:disabled) {
          background: rgba(124,58,237,0.3);
          transform: translateY(-1px);
        }
        .ai-shape-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .generate-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #6d28d9, #9333ea);
          color: #fff;
          border: none;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(124,58,237,0.4);
        }
        .generate-btn:hover {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          transform: translateY(-1px);
        }
        .generate-btn.active {
          background: rgba(167,139,250,0.2);
          border: 1px solid rgba(167,139,250,0.4);
          color: #a78bfa;
          box-shadow: none;
        }
      `}</style>

      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />

      <HamburgerMenu
        onResetCanvas={handleResetCanvas}
        onExportImage={() => {}}
        onChangeBackground={handleChangeBackground}
        canvasBackground={canvasBackground}
        canvasRef={canvasRef}
        onToggleGrid={handleToggleGrid}
        showGrid={showGrid}
        onFindText={handleFindText}
      />

      <AIPanel
        open={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onInsertShapes={handleInsertShapes}
        canvasRef={canvasRef}
      />

      {/* ✅ Added the Right Sidebar here */}
      <RightSidebar 
        open={showRightSidebar} 
        onClose={() => setShowRightSidebar(false)} 
      />

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
      <div className="toolbar">
        <IconButton
          onClick={() => setLocked(l => !l)}
          activated={locked}
          icon={locked ? <Lock size={16} /> : <Unlock size={16} />}
          label={locked ? "Unlock tool" : "Lock tool"}
          shortcut="Q"
        />
        <div className="toolbar-sep" />
        <IconButton
          onClick={() => pickTool("pan")}
          activated={selectedTool === "pan"}
          icon={<Hand size={17} />}
          label="Pan"
          shortcut="H"
        />
        <div className="toolbar-sep" />

        {MAIN_TOOLS.map(({ tool, icon: Icon, label, shortcut }) => (
          <IconButton
            key={tool}
            onClick={() => pickTool(tool)}
            activated={selectedTool === tool}
            icon={<Icon size={17} />}
            label={label}
            shortcut={shortcut}
          />
        ))}

        <div className="toolbar-sep" />
        <IconButton onClick={() => game?.undo()} activated={false} icon={<Undo2 size={17} />} label="Undo" shortcut="Ctrl+Z" />
        <IconButton onClick={() => game?.redo()} activated={false} icon={<Redo2 size={17} />} label="Redo" shortcut="Ctrl+Y" />
        <div className="toolbar-sep" />

        <button className="ai-shape-btn" onClick={handleAI} disabled={aiLoading}>
          <Wand2 size={13} />
          {aiLoading ? "…" : "AI Shape"}
        </button>

        <button
          className={`generate-btn ${showAIPanel ? "active" : ""}`}
          onClick={() => setShowAIPanel(p => !p)}
        >
          <Wand2 size={13} />
          Generate
        </button>

        {/* ✅ Added the new Library button right next to the Generate button */}
        <div className="toolbar-sep" />
        <IconButton
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          activated={showRightSidebar}
          icon={<Library size={17} />}
          label="Library & Collaboration"
        />

        <div className="toolbar-sep" />
        <div style={{ position: "relative" }}>
          <IconButton
            onClick={() => setShowMore(m => !m)}
            activated={showMore}
            icon={<MoreHorizontal size={17} />}
            label="More tools"
          />
          {showMore && (
            <div className="more-menu">
              {MORE_TOOLS.map(({ tool, icon: Icon, label }) => (
                <div key={tool} className="more-item" onClick={() => pickTool(tool)}>
                  <Icon size={15} />{label}
                </div>
              ))}
              <div className="more-item" onClick={() => { setShowAIPanel(true); setShowMore(false); }}>
                <Wand2 size={15} />Text to diagram
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left panel */}
      <div className="side-panel">
        <div className="panel-label">Color</div>
        {COLORS.map(c => (
          <div key={c} className="color-dot" onClick={() => setSelectedColor(c)}
            style={{ background: c, border: selectedColor === c ? "2px solid white" : "2px solid transparent" }}
          />
        ))}
        <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}
          style={{ width: 22, height: 22, border: "none", borderRadius: "50%", cursor: "pointer", padding: 0 }}
        />
        <div className="panel-sep" />
        <div className="panel-label">Width</div>
        {WIDTHS.map(w => (
          <div key={w} className="width-btn" onClick={() => setSelectedWidth(w)}
            style={{ background: selectedWidth === w ? "rgba(255,255,255,0.12)" : "transparent" }}
          >
            <div style={{ width: 18, height: w, background: "white", borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
