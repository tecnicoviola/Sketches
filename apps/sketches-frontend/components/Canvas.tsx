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
  Lasso, Crosshair, Library, Copy, Check,
  Plus, HelpCircle, X, Share2, Image as ImageIcon,
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

// Excalidraw Core Set Order: Lock, Hand, Selection, Rectangle, Diamond, Ellipse, Arrow, Line, Draw/Pencil, Text, Image, Eraser
const MAIN_TOOLS: { tool: Tool; icon: any; label: string; shortcut: string }[] = [
  { tool: "select",  icon: MousePointer2,          label: "Selection", shortcut: "S" },
  { tool: "rect",    icon: RectangleHorizontalIcon, label: "Rectangle", shortcut: "R" },
  { tool: "diamond", icon: Diamond,                 label: "Diamond",   shortcut: "D" },
  { tool: "circle",  icon: Circle,                  label: "Ellipse",   shortcut: "C" },
  { tool: "arrow",   icon: ArrowRight,              label: "Arrow",     shortcut: "A" },
  { tool: "line",    icon: Minus,                   label: "Line",      shortcut: "L" },
  { tool: "pencil",  icon: Pencil,                  label: "Draw",      shortcut: "P" },
  { tool: "text",    icon: Type,                    label: "Text",      shortcut: "T" },
  { tool: "image",   icon: ImageIcon,               label: "Image",     shortcut: "I" },
  { tool: "eraser",  icon: Eraser,                  label: "Eraser",    shortcut: "E" },
];

const SHORTCUTS_LIST = [
  { key: "V / 1", label: "Selection tool" },
  { key: "R / 2", label: "Rectangle tool" },
  { key: "D / 3", label: "Diamond tool" },
  { key: "C / 4", label: "Ellipse tool" },
  { key: "P / 5", label: "Draw tool" },
  { key: "L / 6", label: "Line tool" },
  { key: "A / 7", label: "Arrow tool" },
  { key: "T / 8", label: "Text tool" },
  { key: "E / 9", label: "Eraser tool" },
  { key: "H",     label: "Hand / Pan tool" },
  { key: "Ctrl + Z", label: "Undo action" },
  { key: "Ctrl + Y", label: "Redo action" },
  { key: "Ctrl + '", label: "Toggle grid" },
  { key: "Ctrl + /", label: "Command palette" },
];

export function Canvas({ roomId, roomCode, socket }: { socket: WebSocket; roomId: string; roomCode?: string }) {
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
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [shapesCount, setShapesCount] = useState(0);
  const [isDrawingStarted, setIsDrawingStarted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shared, setShared] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  const displayCode = roomCode || roomId;

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
      g.onShapesCountChange = (count) => setShapesCount(count);
      g.onDrawingStart = () => setIsDrawingStarted(true);
      setGame(g);
      setShapesCount(g.getShapesCount());
      setZoom(g.getZoomPercent());
      return () => { g.destroy(); };
    }
  }, [canvasRef]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (e.key === "?") {
        setShowShortcuts(prev => !prev);
        return;
      }
      const map: Record<string, Tool> = {
        s: "select", v: "select", r: "rect", d: "diamond", c: "circle",
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

  function handleResetCanvas() {
    game?.resetCanvas();
    setShapesCount(0);
    setIsDrawingStarted(false);
  }

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
    setShapesCount(game?.getShapesCount() || 0);
    setIsDrawingStarted(true);
  }

  function pickTool(tool: Tool) {
    setSelectedTool(tool);
    setShowMore(false);
  }

  async function handleCopyRoomCode() {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/canvas/${displayCode}` : displayCode;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Sketches Canvas`,
          text: `Join my canvas room with code ${displayCode}`,
          url: shareUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        // User cancelled share dialog
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

  const canvasCursorStyle = selectedTool === "eraser"
    ? "none"
    : selectedTool === "pan"
    ? "grab"
    : selectedTool === "select"
    ? "default"
    : "crosshair";

  return (
    <div
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      style={{ height: "100vh", overflow: "hidden", background: canvasBackground, position: "relative" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .toolbar {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 2px;
          background: #02122F;
          border: 1px solid rgba(240,236,221,0.12);
          border-radius: 8px;
          padding: 6px 8px;
          z-index: 50;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .toolbar-sep {
          width: 1px;
          height: 24px;
          background: rgba(240,236,221,0.12);
          margin: 0 4px;
        }
        .more-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #02122F;
          border: 1px solid rgba(240,236,221,0.15);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 100;
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .more-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          color: rgba(240,236,221,0.85);
          font-size: 13px;
          font-family: 'Jost', sans-serif;
          transition: background 0.15s;
        }
        .more-item:hover { background: rgba(240,236,221,0.08); }
        
        /* Restyled Left Properties Panel with Squircles and Aligned Grid */
        .side-panel {
          position: fixed;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          background: #02122F;
          border: 1px solid rgba(240,236,221,0.12);
          border-radius: 8px;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 50;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          width: 156px;
        }
        .panel-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(240,236,221,0.45);
          font-family: 'Jost', sans-serif;
          margin-bottom: 2px;
        }
        .panel-sep { height: 1px; background: rgba(240,236,221,0.1); margin: 2px 0; }
        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          align-items: center;
        }
        .color-squircle {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .color-squircle:hover { transform: scale(1.1); }
        .width-btn {
          flex: 1;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .width-btn:hover { background: rgba(240,236,221,0.08); }

        .ai-shape-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: transparent;
          color: rgba(240,236,221,0.8);
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-shape-btn:hover:not(:disabled) {
          background: rgba(240,236,221,0.08);
          color: #F0ECDD;
        }
        .ai-shape-btn.active {
          background: rgba(240,236,221,0.12);
          color: #F0ECDD;
        }
      `}</style>

      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 1200}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        style={{ cursor: canvasCursorStyle }}
      />

      {/* Floating custom circular eraser cursor indicator */}
      {selectedTool === "eraser" && mousePos.x >= 0 && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x,
            top: mousePos.y,
            width: (selectedWidth * 6) + 20,
            height: (selectedWidth * 6) + 20,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1.5px solid #F0ECDD",
            background: "rgba(240,236,221,0.1)",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
            transition: "width 0.15s, height 0.15s",
          }}
        />
      )}

      {/* Top-Right Header Cluster in Unified Surface Container: [AI/Generate] — [Room Code Pill] — [Share Icon] */}
      <div
        className="toolbar"
        style={{
          position: "fixed",
          top: "12px",
          right: "16px",
          left: "auto",
          transform: "none",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "#02122F",
          border: "1px solid rgba(240,236,221,0.12)",
          borderRadius: "8px",
          padding: "6px 8px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Quiet AI / Generate button */}
        <button
          className={`ai-shape-btn ${showAIPanel ? "active" : ""}`}
          onClick={() => setShowAIPanel(p => !p)}
          title="Toggle AI Generation Panel"
        >
          <Wand2 size={14} />
          Generate
        </button>

        <div className="toolbar-sep" />

        {/* Quiet Room Code Info Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 6px",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "18px",
              fontWeight: 400,
              letterSpacing: "3px",
              fontVariantNumeric: "lining-nums tabular-nums",
              fontFeatureSettings: '"lnum" 1, "tnum" 1',
              color: "rgba(240,236,221,0.9)",
              lineHeight: 1,
            }}
          >
            {displayCode}
          </span>
          <button
            onClick={handleCopyRoomCode}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(240,236,221,0.5)",
              cursor: "pointer",
              padding: "3px",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Copy Room Code"
          >
            {copiedCode ? (
              <span style={{ fontSize: "10px", color: "#4ade80", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500, fontFamily: "'Jost', sans-serif" }}>Copied!</span>
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>

        <div className="toolbar-sep" />

        {/* Icon-Only Share Button */}
        <IconButton
          onClick={handleShare}
          activated={shared}
          icon={<Share2 size={16} />}
          label={shared ? "Copied Share Link!" : "Share Room"}
        />
      </div>

      {/* Empty-Canvas Centered State Placeholder: Sole focal point "SKETCHES" wordmark */}
      {!isDrawingStarted && shapesCount === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 400,
              color: "rgba(240,236,221,0.18)",
              letterSpacing: "8px",
              textTransform: "uppercase",
              margin: 0,
              padding: 0,
              lineHeight: 1,
            }}
          >
            SKETCHES
          </h1>
        </div>
      )}

      {/* Bottom-left Chrome: Zoom & Undo/Redo */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "#02122F",
          border: "1px solid rgba(240,236,221,0.12)",
          borderRadius: "6px",
          padding: "4px 8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        <button
          onClick={() => setZoom(game?.zoomOut() || zoom)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(240,236,221,0.7)",
            padding: "4px 6px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Zoom Out"
        >
          <Minus size={13} />
        </button>

        <span
          onClick={() => setZoom(game?.resetZoom() || 100)}
          style={{
            fontSize: "11px",
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            color: "rgba(240,236,221,0.8)",
            minWidth: "38px",
            textAlign: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
          title="Click to reset zoom"
        >
          {zoom}%
        </span>

        <button
          onClick={() => setZoom(game?.zoomIn() || zoom)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(240,236,221,0.7)",
            padding: "4px 6px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Zoom In"
        >
          <Plus size={13} />
        </button>

        <div style={{ width: "1px", height: "16px", background: "rgba(240,236,221,0.12)", margin: "0 4px" }} />

        <button
          onClick={() => { game?.undo(); setShapesCount(game?.getShapesCount() || 0); }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(240,236,221,0.7)",
            padding: "4px 6px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} />
        </button>

        <button
          onClick={() => { game?.redo(); setShapesCount(game?.getShapesCount() || 0); }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(240,236,221,0.7)",
            padding: "4px 6px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={13} />
        </button>
      </div>

      {/* Bottom-right Help / Shortcuts affordance button */}
      <button
        onClick={() => setShowShortcuts(true)}
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 60,
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          background: "#02122F",
          border: "1px solid rgba(240,236,221,0.12)",
          color: "rgba(240,236,221,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          transition: "border-color 0.2s",
        }}
        title="Keyboard Shortcuts (?)"
      >
        <HelpCircle size={15} />
      </button>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(2,18,47,0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "420px",
              maxWidth: "92vw",
              background: "#02122F",
              border: "1px solid rgba(240,236,221,0.15)",
              borderRadius: "8px",
              padding: "28px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
              color: "#F0ECDD",
              fontFamily: "'Jost', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "24px",
                  fontWeight: 300,
                  letterSpacing: "-0.2px",
                }}
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240,236,221,0.5)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
              {SHORTCUTS_LIST.map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "rgba(240,236,221,0.7)" }}>
                  <span>{label}</span>
                  <kbd style={{ background: "rgba(240,236,221,0.08)", border: "1px solid rgba(240,236,221,0.15)", padding: "1px 6px", borderRadius: "3px", fontSize: "10px", fontFamily: "monospace", color: "#F0ECDD" }}>
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
          fontFamily: "'Jost', sans-serif",
        }}>
          {cursor.userId.slice(0, 8)}
        </div>
      ))}

      {/* Floating top tool row matching Excalidraw's core order & restraint */}
      <div className="toolbar">
        <IconButton
          onClick={() => setLocked(l => !l)}
          activated={locked}
          icon={locked ? <Lock size={16} /> : <Unlock size={16} />}
          label={locked ? "Unlock tool" : "Lock tool"}
          shortcut="Q"
        />
        <IconButton
          onClick={() => pickTool("pan")}
          activated={selectedTool === "pan"}
          icon={<Hand size={17} />}
          label="Hand / Pan"
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
        <div style={{ position: "relative" }}>
          <IconButton
            onClick={() => setShowMore(m => !m)}
            activated={showMore}
            icon={<MoreHorizontal size={17} />}
            label="More tools"
          />
          {showMore && (
            <div className="more-menu">
              <div className="more-item" onClick={() => { setShowRightSidebar(true); setShowMore(false); }}>
                <Library size={15} />Library & Collaboration
              </div>
              <div className="more-item" onClick={() => pickTool("lasso")}>
                <Lasso size={15} />Lasso Select
              </div>
              <div className="more-item" onClick={() => pickTool("laser")}>
                <Crosshair size={15} />Laser Pointer
              </div>
              <div className="more-item" onClick={() => { setShowAIPanel(true); setShowMore(false); }}>
                <Wand2 size={15} />Text to diagram
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Left Properties Panel matching Excalidraw's layout & polish */}
      <div className="side-panel">
        {/* Stroke Color */}
        <div className="panel-label">STROKE</div>
        <div className="color-grid">
          {COLORS.map(c => (
            <div
              key={c}
              className="color-squircle"
              onClick={() => setSelectedColor(c)}
              style={{
                background: c,
                border: c === "#ffffff" ? "1px solid rgba(240,236,221,0.2)" : "1px solid transparent",
                boxShadow: selectedColor === c ? "0 0 0 2px #02122F, 0 0 0 3.5px #F0ECDD" : "none",
              }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            style={{
              width: 24,
              height: 24,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              padding: 0,
              background: "transparent",
            }}
            title="Custom color"
          />
        </div>

        <div className="panel-sep" />

        {/* Stroke Width */}
        <div className="panel-label">STROKE WIDTH</div>
        <div style={{ display: "flex", gap: "6px" }}>
          {WIDTHS.map((w, idx) => (
            <div
              key={w}
              className="width-btn"
              onClick={() => setSelectedWidth(w)}
              style={{
                background: selectedWidth === w ? "rgba(240,236,221,0.15)" : "transparent",
                border: selectedWidth === w ? "1px solid rgba(240,236,221,0.3)" : "1px solid rgba(240,236,221,0.08)",
              }}
              title={["Thin", "Medium", "Thick"][idx]}
            >
              <div style={{ width: 14, height: w, background: "#F0ECDD", borderRadius: 2 }} />
            </div>
          ))}
        </div>

        <div className="panel-sep" />

        {/* Canvas Background */}
        <div className="panel-label">BACKGROUND</div>
        <div className="color-grid">
          {[
            { label: "Dark", value: "#1b1b1f" },
            { label: "Navy", value: "#02122F" },
            { label: "White", value: "#ffffff" },
            { label: "Sage", value: "#2d4a3e" },
          ].map(bg => (
            <div
              key={bg.value}
              className="color-squircle"
              onClick={() => handleChangeBackground(bg.value)}
              style={{
                background: bg.value,
                border: bg.value === "#ffffff" ? "1px solid rgba(240,236,221,0.2)" : "1px solid transparent",
                boxShadow: canvasBackground === bg.value ? "0 0 0 2px #02122F, 0 0 0 3.5px #F0ECDD" : "none",
              }}
              title={bg.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
