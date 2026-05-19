"use client";

import { useState, useEffect, useRef } from "react";
import {
  FolderOpen, Download, Image, Users, Terminal, Search,
  HelpCircle, Trash2, Sparkles, GitBranch, MessageCircle,
  UserPlus, Settings, Sun, Moon, Monitor, ChevronRight,
  X, Copy, Check, Grid, ZoomIn, ZoomOut
} from "lucide-react";

const LANGUAGES = ["English", "Hindi", "German", "French", "Spanish", "Japanese", "Chinese", "Arabic", "Portuguese", "Russian"];

const CANVAS_BACKGROUNDS = [
  { label: "White",    value: "#ffffff" },
  { label: "Dark",     value: "#1b1b1f" },
  { label: "Navy",     value: "#02122F" },
  { label: "Sage",     value: "#2d4a3e" },
  { label: "Slate",    value: "#2c3e50" },
  { label: "Midnight", value: "#0d0d0d" },
];

const COMMANDS = [
  { label: "Export image",        shortcut: "Ctrl+Shift+E", action: "export" },
  { label: "Reset canvas",        shortcut: "",             action: "reset" },
  { label: "Toggle grid",         shortcut: "Ctrl+'",       action: "grid" },
  { label: "Live collaboration",  shortcut: "",             action: "collab" },
  { label: "Find on canvas",      shortcut: "Ctrl+F",       action: "find" },
  { label: "Toggle dark mode",    shortcut: "",             action: "theme" },
  { label: "Undo",                shortcut: "Ctrl+Z",       action: "undo" },
  { label: "Redo",                shortcut: "Ctrl+Y",       action: "redo" },
  { label: "Help",                shortcut: "?",            action: "help" },
];

interface Props {
  onResetCanvas: () => void;
  onExportImage: () => void;
  onChangeBackground: (color: string) => void;
  canvasBackground: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onToggleGrid: (show: boolean) => void;
  showGrid: boolean;
  onFindText: (query: string) => { found: boolean; matchCount: number };
}

export function HamburgerMenu({
  onResetCanvas, onExportImage, onChangeBackground,
  canvasBackground, canvasRef, onToggleGrid, showGrid, onFindText,
}: Props) {
  const [open, setOpen]                     = useState(false);
  const [theme, setTheme]                   = useState<"light"|"dark"|"system">("dark");
  const [language, setLanguage]             = useState("English");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showPrefs, setShowPrefs]           = useState(false);

  // Export modal
  const [showExport, setShowExport]         = useState(false);
  const [exportBg, setExportBg]             = useState(true);
  const [exportDark, setExportDark]         = useState(true);
  const [exportScale, setExportScale]       = useState<1|2|3>(1);
  const [exportFilename, setExportFilename] = useState("");
  const exportPreviewRef                    = useRef<HTMLCanvasElement>(null);

  // Live collab modal
  const [showCollab, setShowCollab]         = useState(false);
  const [collabName, setCollabName]         = useState("Anonymous");
  const [collabCopied, setCollabCopied]     = useState(false);
  const qrRef                               = useRef<HTMLCanvasElement>(null);

  // Command palette
  const [showCmd, setShowCmd]               = useState(false);
  const [cmdQuery, setCmdQuery]             = useState("");
  const [cmdIndex, setCmdIndex]             = useState(0);
  const cmdInputRef                         = useRef<HTMLInputElement>(null);

  // Find on canvas
  const [showFind, setShowFind]             = useState(false);
  const [findQuery, setFindQuery]           = useState("");
  const [findResult, setFindResult]         = useState<string>("");
  const findInputRef                        = useRef<HTMLInputElement>(null);

  // ── Theme effect — actually changes canvas bg + UI panel colors ──
  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const bg = isDark ? "#1b1b1f" : "#f5f5f0";
    const panelBg = isDark ? "#2c2c32" : "#ffffff";
    const panelBorder = isDark ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.08)";
    const textColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";

    // Apply to canvas background
    onChangeBackground(bg);

    // Apply CSS vars to root so toolbar/panels react
    const root = document.documentElement;
    root.style.setProperty("--panel-bg", panelBg);
    root.style.setProperty("--panel-border", panelBorder);
    root.style.setProperty("--text-color", textColor);
    root.style.setProperty("--text-muted", isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)");
    root.style.setProperty("--hover-bg", isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)");
    root.style.setProperty("--sep-color", isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)");
  }, [theme]);

  // ── Global keyboard shortcuts ─────────────────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openCmd(); }
      if (e.key === "f" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openFind(); }
      if (e.key === "'" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onToggleGrid(!showGrid); }
      if (e.key === "Escape") { setShowCmd(false); setShowFind(false); setShowExport(false); setShowCollab(false); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showGrid]);

  // ── Command palette focus ─────────────────────────────────────
  useEffect(() => { if (showCmd) setTimeout(() => cmdInputRef.current?.focus(), 50); }, [showCmd]);
  useEffect(() => { if (showFind) setTimeout(() => findInputRef.current?.focus(), 50); }, [showFind]);

  // ── Export preview ────────────────────────────────────────────
  useEffect(() => {
    if (!showExport) return;
    const now = new Date();
    setExportFilename(`Untitled-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`);
    setTimeout(renderExportPreview, 100);
  }, [showExport]);

  useEffect(() => { if (showExport) renderExportPreview(); }, [exportBg, exportDark]);

  function renderExportPreview() {
    const src = canvasRef.current;
    const dest = exportPreviewRef.current;
    if (!src || !dest) return;
    const ctx = dest.getContext("2d")!;
    dest.width = src.width;
    dest.height = src.height;
    if (exportBg) {
      ctx.fillStyle = exportDark ? "#1b1b1f" : "#ffffff";
      ctx.fillRect(0, 0, dest.width, dest.height);
    } else {
      ctx.clearRect(0, 0, dest.width, dest.height);
    }
    ctx.drawImage(src, 0, 0);
  }

  function getExportCanvas() {
    const src = canvasRef.current!;
    const off = document.createElement("canvas");
    off.width  = src.width  * exportScale;
    off.height = src.height * exportScale;
    const ctx = off.getContext("2d")!;
    if (exportBg) {
      ctx.fillStyle = exportDark ? "#1b1b1f" : "#ffffff";
      ctx.fillRect(0, 0, off.width, off.height);
    }
    ctx.scale(exportScale, exportScale);
    ctx.drawImage(src, 0, 0);
    return off;
  }

  function handleExportPNG() {
    const c = getExportCanvas();
    const a = document.createElement("a");
    a.download = `${exportFilename}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
  }

  function handleExportSVG() {
    const src = canvasRef.current!;
    const w = src.width * exportScale, h = src.height * exportScale;
    const dataURL = src.toDataURL("image/png");
    const bg = exportBg ? `<rect width="${w}" height="${h}" fill="${exportDark ? "#1b1b1f" : "#ffffff"}"/>` : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${bg}<image href="${dataURL}" width="${w}" height="${h}"/></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${exportFilename}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportCopy() {
    const c = getExportCanvas();
    c.toBlob(blob => {
      if (!blob) return;
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    });
  }

  // ── QR code (simple canvas-based, no library) ─────────────────
  useEffect(() => {
    if (!showCollab || !qrRef.current) return;
    // Draw a simple decorative QR-like placeholder
    // (For a real QR, integrate qrcode.js — shown as pattern here)
    drawSimpleQR(qrRef.current, window.location.href);
  }, [showCollab]);

  function drawSimpleQR(canvas: HTMLCanvasElement, _text: string) {
    const size = 180;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    const cell = 6;
    const cols = Math.floor(size / cell);
    // Seed-based pseudo-random for reproducible pattern
    let seed = 0;
    for (let i = 0; i < _text.length; i++) seed = (_text.charCodeAt(i) + ((seed << 5) - seed)) | 0;
    function rand() { seed = (seed * 1664525 + 1013904223) | 0; return (seed >>> 0) / 4294967296; }
    ctx.fillStyle = "#111";
    for (let row = 0; row < cols; row++) {
      for (let col = 0; col < cols; col++) {
        if (rand() > 0.5) ctx.fillRect(col * cell, row * cell, cell - 1, cell - 1);
      }
    }
    // Corner finder patterns
    function finder(x: number, y: number) {
      ctx.fillStyle = "#111";
      ctx.fillRect(x, y, cell * 7, cell * 7);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
      ctx.fillStyle = "#111";
      ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
    }
    finder(0, 0);
    finder(size - cell * 7, 0);
    finder(0, size - cell * 7);
  }

  function handleCollabCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCollabCopied(true);
    setTimeout(() => setCollabCopied(false), 2000);
  }

  // ── Command palette ───────────────────────────────────────────
  function openCmd() { setCmdQuery(""); setCmdIndex(0); setShowCmd(true); setOpen(false); }
  function openFind() { setFindQuery(""); setFindResult(""); setShowFind(true); setOpen(false); }

  const filteredCmds = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  function runCommand(action: string) {
    setShowCmd(false);
    switch (action) {
      case "export":  setShowExport(true);  break;
      case "reset":   if (confirm("Reset the canvas?")) onResetCanvas(); break;
      case "grid":    onToggleGrid(!showGrid); break;
      case "collab":  setShowCollab(true);  break;
      case "find":    openFind();           break;
      case "theme":   setTheme(t => t === "dark" ? "light" : "dark"); break;
      case "help":    window.open("https://github.com", "_blank"); break;
    }
  }

  function handleCmdKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCmdIndex(i => Math.min(i + 1, filteredCmds.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCmdIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filteredCmds[cmdIndex]) runCommand(filteredCmds[cmdIndex]!.action);
    if (e.key === "Escape") setShowCmd(false);
  }

  function handleFind(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!findQuery.trim()) return;
      const result = onFindText(findQuery);
      setFindResult(result.found
        ? `✓ Found ${result.matchCount} match${result.matchCount !== 1 ? "es" : ""}`
        : "✗ Not found"
      );
    }
    if (e.key === "Escape") { setShowFind(false); setFindResult(""); }
  }

  function handleFindClick() {
    if (!findQuery.trim()) return;
    const result = onFindText(findQuery);
    setFindResult(result.found
      ? `✓ Found ${result.matchCount} match${result.matchCount !== 1 ? "es" : ""}`
      : "✗ Not found"
    );
  }

  function handleOpen() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,image/*";
    input.click();
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: "pointer",
        background: value ? "#7c3aed" : "rgba(255,255,255,0.1)",
        border: `1px solid ${value ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.15)"}`,
        position: "relative", transition: "all 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: value ? 20 : 2,
        width: 16, height: 16, borderRadius: "50%",
        background: value ? "#fff" : "rgba(255,255,255,0.4)",
        transition: "left 0.2s",
      }} />
    </div>
  );

  const Overlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );

  return (
    <>
      <style>{`
        .hm-overlay { position:fixed;inset:0;z-index:200;pointer-events:none; }
        .hm-overlay.open { pointer-events:all; }
        .hm-backdrop { position:absolute;inset:0;background:rgba(0,0,0,0.3);opacity:0;transition:opacity 0.2s; }
        .hm-overlay.open .hm-backdrop { opacity:1; }
        .hm-panel {
          position:absolute;top:12px;left:12px;width:300px;
          background:#2c2c32;border:1px solid rgba(255,255,255,0.08);
          border-radius:12px;overflow:hidden;
          box-shadow:0 16px 48px rgba(0,0,0,0.6);
          transform:scale(0.95) translateY(-8px);opacity:0;
          transition:transform 0.2s cubic-bezier(0.22,1,0.36,1),opacity 0.2s;
          pointer-events:none;max-height:90vh;overflow-y:auto;
        }
        .hm-overlay.open .hm-panel { transform:scale(1) translateY(0);opacity:1;pointer-events:all; }
        .hm-item { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;color:rgba(255,255,255,0.8);font-size:13.5px;font-family:sans-serif;cursor:pointer;transition:background 0.15s; }
        .hm-item:hover { background:rgba(255,255,255,0.07); }
        .hm-item-left { display:flex;align-items:center;gap:12px; }
        .hm-item-shortcut { font-size:11px;color:rgba(255,255,255,0.3);font-family:monospace;white-space:nowrap; }
        .hm-sep { height:1px;background:rgba(255,255,255,0.07);margin:4px 0; }
        .hm-section-label { padding:8px 16px 4px;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.25);font-family:sans-serif; }
        .hm-theme-btns { display:flex;gap:6px;padding:0 16px 12px; }
        .hm-theme-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:12px;font-family:sans-serif;cursor:pointer;transition:all 0.15s; }
        .hm-theme-btn.active { background:rgba(99,102,241,0.25);border-color:rgba(99,102,241,0.5);color:#a5b4fc; }
        .hm-theme-btn:hover:not(.active) { background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.8); }
        .hm-bg-grid { display:flex;gap:8px;padding:0 16px 14px;flex-wrap:wrap; }
        .hm-bg-dot { width:28px;height:28px;border-radius:6px;cursor:pointer;transition:transform 0.15s;border:2px solid transparent;box-sizing:border-box; }
        .hm-bg-dot:hover { transform:scale(1.1); }
        .hm-bg-dot.active { border-color:#a78bfa; }
        .hm-lang-dropdown { margin:0 16px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden; }
        .hm-lang-option { padding:8px 14px;font-size:13px;color:rgba(255,255,255,0.7);font-family:sans-serif;cursor:pointer;transition:background 0.15s; }
        .hm-lang-option:hover { background:rgba(255,255,255,0.07); }
        .hm-lang-option.active { color:#a78bfa;background:rgba(99,102,241,0.1); }
        .hm-panel::-webkit-scrollbar { width:4px; }
        .hm-panel::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1);border-radius:2px; }

        /* Command palette */
        .cmd-palette {
          width:580px;max-width:95vw;background:#1e1e24;
          border:1px solid rgba(255,255,255,0.12);border-radius:14px;
          overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.8);
        }
        .cmd-input-wrap {
          display:flex;align-items:center;gap:12px;
          padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .cmd-input {
          flex:1;background:none;border:none;outline:none;
          font-size:15px;color:rgba(255,255,255,0.9);font-family:sans-serif;
        }
        .cmd-input::placeholder { color:rgba(255,255,255,0.25); }
        .cmd-list { max-height:360px;overflow-y:auto;padding:6px; }
        .cmd-list::-webkit-scrollbar { width:4px; }
        .cmd-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1);border-radius:2px; }
        .cmd-item {
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 14px;border-radius:8px;cursor:pointer;
          font-size:13.5px;font-family:sans-serif;color:rgba(255,255,255,0.75);
          transition:background 0.1s;
        }
        .cmd-item.active { background:rgba(124,58,237,0.25);color:#fff; }
        .cmd-item:hover { background:rgba(255,255,255,0.06); }
        .cmd-shortcut {
          font-size:11px;font-family:monospace;color:rgba(255,255,255,0.25);
          background:rgba(255,255,255,0.07);padding:2px 7px;border-radius:4px;
        }
        .cmd-footer {
          padding:10px 20px;border-top:1px solid rgba(255,255,255,0.06);
          display:flex;gap:16px;
          font-size:11px;color:rgba(255,255,255,0.25);font-family:sans-serif;
        }
        .cmd-footer kbd {
          background:rgba(255,255,255,0.08);padding:1px 6px;
          border-radius:4px;color:rgba(255,255,255,0.4);
        }

        /* Export modal */
        .export-modal {
          width:700px;max-width:95vw;background:#1e1e24;
          border:1px solid rgba(255,255,255,0.1);border-radius:14px;
          overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.8);
          display:grid;grid-template-columns:1fr 1fr;
        }
        .export-preview-pane {
          background:#111;display:flex;align-items:center;
          justify-content:center;padding:24px;min-height:280px;
        }
        .export-options-pane { padding:24px;display:flex;flex-direction:column;gap:16px; }
        .export-header { font-size:16px;font-weight:600;color:rgba(255,255,255,0.9);font-family:sans-serif;margin-bottom:4px; }
        .export-row { display:flex;align-items:center;justify-content:space-between;font-size:13px;color:rgba(255,255,255,0.7);font-family:sans-serif; }
        .export-scale-btns { display:flex;gap:6px; }
        .export-scale-btn {
          width:36px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);
          background:transparent;color:rgba(255,255,255,0.5);font-size:12px;
          font-family:sans-serif;cursor:pointer;transition:all 0.15s;
        }
        .export-scale-btn.active { background:rgba(124,58,237,0.3);border-color:rgba(124,58,237,0.5);color:#a78bfa; }
        .export-filename {
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;padding:8px 12px;color:rgba(255,255,255,0.8);
          font-size:13px;font-family:sans-serif;outline:none;width:100%;box-sizing:border-box;
        }
        .export-filename:focus { border-color:rgba(124,58,237,0.5); }
        .export-btns { display:flex;gap:8px;margin-top:auto; }
        .export-btn {
          flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
          padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8);
          font-size:12px;font-weight:600;font-family:sans-serif;cursor:pointer;
          transition:all 0.15s;
        }
        .export-btn:hover { background:rgba(255,255,255,0.1);color:#fff; }
        .export-btn.primary { background:rgba(124,58,237,0.3);border-color:rgba(124,58,237,0.5);color:#a78bfa; }
        .export-btn.primary:hover { background:rgba(124,58,237,0.45); }

        /* Collab modal */
        .collab-modal {
          width:480px;max-width:95vw;background:#1e1e24;
          border:1px solid rgba(255,255,255,0.1);border-radius:14px;
          padding:28px;box-shadow:0 24px 64px rgba(0,0,0,0.8);
        }
        .collab-title { font-size:18px;font-weight:600;color:rgba(255,255,255,0.9);font-family:sans-serif;margin-bottom:20px; }
        .collab-label { font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);font-family:sans-serif;margin-bottom:6px; }
        .collab-input {
          width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;padding:10px 14px;color:rgba(255,255,255,0.85);
          font-size:14px;font-family:sans-serif;outline:none;box-sizing:border-box;
        }
        .collab-input:focus { border-color:rgba(124,58,237,0.5); }
        .collab-link-row { display:flex;gap:8px;align-items:center; }
        .collab-link-box {
          flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:8px;padding:10px 14px;color:rgba(255,255,255,0.4);
          font-size:12px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        }
        .collab-copy-btn {
          display:flex;align-items:center;gap:6px;padding:10px 16px;
          background:rgba(124,58,237,0.25);border:1px solid rgba(124,58,237,0.4);
          border-radius:8px;color:#a78bfa;font-size:13px;font-weight:600;
          font-family:sans-serif;cursor:pointer;white-space:nowrap;transition:all 0.15s;
        }
        .collab-copy-btn:hover { background:rgba(124,58,237,0.4); }
        .collab-qr { display:flex;justify-content:center;margin:20px 0; }
        .collab-qr canvas { border-radius:12px;border:4px solid #fff; }
        .collab-info {
          font-size:12px;color:rgba(255,255,255,0.3);font-family:sans-serif;
          line-height:1.6;border-top:1px solid rgba(255,255,255,0.07);padding-top:16px;
        }

        /* Find on canvas */
        .find-bar {
          position:fixed;top:70px;left:50%;transform:translateX(-50%);
          z-index:900;background:#1e1e24;border:1px solid rgba(255,255,255,0.12);
          border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:10px;
          box-shadow:0 8px 32px rgba(0,0,0,0.6);min-width:320px;
        }
        .find-input {
          flex:1;background:none;border:none;outline:none;
          font-size:14px;color:rgba(255,255,255,0.85);font-family:sans-serif;
        }
        .find-input::placeholder { color:rgba(255,255,255,0.25); }
        .find-btn {
          padding:5px 12px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);
          font-size:12px;font-family:sans-serif;cursor:pointer;white-space:nowrap;
          transition:background 0.15s;
        }
        .find-btn:hover { background:rgba(255,255,255,0.12);color:#fff; }
      `}</style>

      {/* ── Hamburger button ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", top:12, left:12, width:40, height:40,
          borderRadius:8,
          background: open ? "rgba(99,102,241,0.25)" : "#2c2c32",
          border: `1px solid ${open ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
          color: open ? "#a5b4fc" : "rgba(255,255,255,0.8)",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:300, transition:"all 0.15s", boxShadow:"0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {open
          ? <X size={18} />
          : <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4"    width="14" height="1.5" rx="1" fill="currentColor"/>
              <rect x="2" y="8.25" width="14" height="1.5" rx="1" fill="currentColor"/>
              <rect x="2" y="12.5" width="14" height="1.5" rx="1" fill="currentColor"/>
            </svg>
        }
      </button>

      {/* ── Slide-out panel ───────────────────────────────────────── */}
      <div className={`hm-overlay ${open ? "open" : ""}`}>
        <div className="hm-backdrop" onClick={() => setOpen(false)} />
        <div className="hm-panel">
          <div style={{ paddingTop:8 }} />

          <div className="hm-item" onClick={handleOpen}>
            <div className="hm-item-left"><FolderOpen size={15} />Open</div>
            <span className="hm-item-shortcut">Ctrl+O</span>
          </div>
          <div className="hm-item">
            <div className="hm-item-left"><Download size={15} />Save to…</div>
          </div>
          <div className="hm-item" onClick={() => { setShowExport(true); setOpen(false); }}>
            <div className="hm-item-left"><Image size={15} />Export image…</div>
            <span className="hm-item-shortcut">Ctrl+Shift+E</span>
          </div>

          <div className="hm-sep" />

          <div className="hm-item" onClick={() => { setShowCollab(true); setOpen(false); }}>
            <div className="hm-item-left"><Users size={15} />Live collaboration…</div>
          </div>

          <div className="hm-sep" />

          <div className="hm-item" onClick={() => { openCmd(); }}>
            <div className="hm-item-left" style={{ color:"#a78bfa" }}><Terminal size={15} />Command palette</div>
            <span className="hm-item-shortcut" style={{ color:"#a78bfa" }}>Ctrl+/</span>
          </div>
          <div className="hm-item" onClick={() => { openFind(); }}>
            <div className="hm-item-left"><Search size={15} />Find on canvas</div>
            <span className="hm-item-shortcut">Ctrl+F</span>
          </div>
          <div className="hm-item" onClick={() => { window.open("https://github.com", "_blank"); setOpen(false); }}>
            <div className="hm-item-left"><HelpCircle size={15} />Help</div>
            <span className="hm-item-shortcut">?</span>
          </div>
          <div className="hm-item" onClick={() => {
            if (confirm("Reset the canvas? This cannot be undone.")) { onResetCanvas(); setOpen(false); }
          }}>
            <div className="hm-item-left" style={{ color:"#f87171" }}>
              <Trash2 size={15} color="#f87171" />Reset the canvas
            </div>
          </div>

          <div className="hm-sep" />

          <div className="hm-item" onClick={() => setOpen(false)}>
            <div className="hm-item-left" style={{ color:"#a78bfa" }}>
              <Sparkles size={15} color="#a78bfa" />Sketches+
            </div>
          </div>
          <div className="hm-item" onClick={() => { window.open("https://github.com","_blank"); setOpen(false); }}>
            <div className="hm-item-left"><GitBranch size={15} />GitHub</div>
          </div>
          <div className="hm-item" onClick={() => { window.open("https://twitter.com","_blank"); setOpen(false); }}>
            <div className="hm-item-left">
              <span style={{ fontSize:15, fontWeight:700, lineHeight:1, width:15, display:"inline-block" }}>𝕏</span>
              Follow us
            </div>
          </div>
          <div className="hm-item" onClick={() => { window.open("https://discord.com","_blank"); setOpen(false); }}>
            <div className="hm-item-left"><MessageCircle size={15} />Discord chat</div>
          </div>
          <div className="hm-item" onClick={() => setOpen(false)}>
            <div className="hm-item-left" style={{ color:"#a78bfa" }}>
              <UserPlus size={15} color="#a78bfa" />Sign up
            </div>
          </div>

          <div className="hm-sep" />

          {/* Preferences */}
          <div className="hm-item" onClick={() => setShowPrefs(p => !p)}>
            <div className="hm-item-left"><Settings size={15} />Preferences</div>
            <ChevronRight size={14} style={{ opacity:0.4, transform:showPrefs?"rotate(90deg)":"none", transition:"transform 0.2s" }} />
          </div>

          {showPrefs && (
            <div style={{ background:"rgba(0,0,0,0.15)", paddingTop:4, paddingBottom:4 }}>
              <div className="hm-section-label">Grid</div>
              <div className="hm-item" style={{ paddingTop:6, paddingBottom:6 }}>
                <div className="hm-item-left" style={{ fontSize:13 }}><Grid size={13} />Show grid</div>
                <Toggle value={showGrid} onChange={onToggleGrid} />
              </div>
            </div>
          )}

          {/* Theme */}
          <div className="hm-section-label" style={{ paddingTop:12 }}>Theme</div>
          <div className="hm-theme-btns">
            {(["light","dark","system"] as const).map(t => (
              <button key={t} className={`hm-theme-btn ${theme===t?"active":""}`} onClick={() => setTheme(t)}>
                {t==="light" ? <Sun size={13}/> : t==="dark" ? <Moon size={13}/> : <Monitor size={13}/>}
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {/* Language */}
          <div className="hm-section-label">Language</div>
          <div className="hm-item" onClick={() => setShowLangDropdown(l => !l)}>
            <div className="hm-item-left" style={{ fontSize:13 }}>🌐 {language}</div>
            <ChevronRight size={14} style={{ opacity:0.4, transform:showLangDropdown?"rotate(90deg)":"none", transition:"transform 0.2s" }} />
          </div>
          {showLangDropdown && (
            <div className="hm-lang-dropdown">
              {LANGUAGES.map(lang => (
                <div key={lang} className={`hm-lang-option ${language===lang?"active":""}`}
                  onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}>
                  {lang}
                </div>
              ))}
            </div>
          )}

          {/* Canvas background */}
          <div className="hm-section-label">Canvas background</div>
          <div className="hm-bg-grid">
            {CANVAS_BACKGROUNDS.map(bg => (
              <div key={bg.value}
                className={`hm-bg-dot ${canvasBackground===bg.value?"active":""}`}
                style={{
                  background: bg.value,
                  border: canvasBackground===bg.value ? "2px solid #a78bfa"
                    : bg.value==="#ffffff" ? "2px solid rgba(255,255,255,0.2)" : "2px solid transparent"
                }}
                title={bg.label}
                onClick={() => onChangeBackground(bg.value)}
              />
            ))}
          </div>

          <div style={{ paddingBottom:8 }} />
        </div>
      </div>

      {/* ── Export Image Modal ────────────────────────────────────── */}
      {showExport && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }} onClick={() => setShowExport(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            {/* Preview pane */}
            <div className="export-preview-pane">
              <canvas ref={exportPreviewRef} style={{
                maxWidth:"100%", maxHeight:220, borderRadius:6,
                border:"1px solid rgba(255,255,255,0.1)",
                background: exportBg ? (exportDark?"#1b1b1f":"#fff") : "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px",
              }} />
            </div>
            {/* Options pane */}
            <div className="export-options-pane">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div className="export-header">Export image</div>
                <button onClick={() => setShowExport(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>
                  <X size={18} />
                </button>
              </div>

              <div className="export-row">
                <span>Only selected</span>
                <Toggle value={false} onChange={() => {}} />
              </div>
              <div className="export-row">
                <span>Background</span>
                <Toggle value={exportBg} onChange={setExportBg} />
              </div>
              <div className="export-row">
                <span>Dark mode</span>
                <Toggle value={exportDark} onChange={setExportDark} />
              </div>
              <div className="export-row">
                <span>Scale</span>
                <div className="export-scale-btns">
                  {([1,2,3] as const).map(s => (
                    <button key={s} className={`export-scale-btn ${exportScale===s?"active":""}`} onClick={() => setExportScale(s)}>
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginBottom:6, fontFamily:"sans-serif", letterSpacing:1 }}>FILENAME</div>
                <input className="export-filename" value={exportFilename} onChange={e => setExportFilename(e.target.value)} />
              </div>

              <div className="export-btns">
                <button className="export-btn primary" onClick={handleExportPNG}><Download size={13}/>PNG</button>
                <button className="export-btn" onClick={handleExportSVG}><Download size={13}/>SVG</button>
                <button className="export-btn" onClick={handleExportCopy}><Copy size={13}/>Copy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Collaboration Modal ──────────────────────────────── */}
      {showCollab && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center",
        }} onClick={() => setShowCollab(false)}>
          <div className="collab-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div className="collab-title">Live collaboration</div>
              <button onClick={() => setShowCollab(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div className="collab-label">Your name</div>
            <input className="collab-input" value={collabName}
              onChange={e => setCollabName(e.target.value)}
              style={{ marginBottom:16 }}
            />

            <div className="collab-label">Link</div>
            <div className="collab-link-row" style={{ marginBottom:16 }}>
              <div className="collab-link-box">{window.location.href}</div>
              <button className="collab-copy-btn" onClick={handleCollabCopy}>
                {collabCopied ? <><Check size={14}/>Copied!</> : <><Copy size={14}/>Copy link</>}
              </button>
            </div>

            <div className="collab-qr">
              <canvas ref={qrRef} style={{ width:180, height:180 }} />
            </div>

            <div className="collab-info">
              🔒 Sessions are private — share the link above to invite collaborators. Stopping the session will disconnect you from the room, but others can continue.
            </div>
          </div>
        </div>
      )}

      {/* ── Command Palette ───────────────────────────────────────── */}
      {showCmd && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"flex-start", justifyContent:"center",
          paddingTop:120,
        }} onClick={() => setShowCmd(false)}>
          <div className="cmd-palette" onClick={e => e.stopPropagation()}>
            <div className="cmd-input-wrap">
              <Search size={16} color="rgba(255,255,255,0.3)" />
              <input
                ref={cmdInputRef}
                className="cmd-input"
                placeholder="Search menus, commands…"
                value={cmdQuery}
                onChange={e => { setCmdQuery(e.target.value); setCmdIndex(0); }}
                onKeyDown={handleCmdKey}
              />
              <kbd style={{ fontSize:11, background:"rgba(255,255,255,0.07)", padding:"2px 8px", borderRadius:4, color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>Esc</kbd>
            </div>
            <div className="cmd-list">
              {filteredCmds.length === 0 && (
                <div style={{ padding:"20px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13, fontFamily:"sans-serif" }}>
                  No commands found
                </div>
              )}
              {filteredCmds.map((cmd, i) => (
                <div
                  key={cmd.action}
                  className={`cmd-item ${i === cmdIndex ? "active" : ""}`}
                  onMouseEnter={() => setCmdIndex(i)}
                  onClick={() => runCommand(cmd.action)}
                >
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <span className="cmd-shortcut">{cmd.shortcut}</span>}
                </div>
              ))}
            </div>
            <div className="cmd-footer">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Find on Canvas ────────────────────────────────────────── */}
      {showFind && (
        <div className="find-bar">
          <Search size={15} color="rgba(255,255,255,0.3)" />
          <input
            ref={findInputRef}
            className="find-input"
            placeholder="Find text on canvas…"
            value={findQuery}
            onChange={e => { setFindQuery(e.target.value); setFindResult(""); }}
            onKeyDown={handleFind}
          />
          {findResult && (
            <span style={{
              fontSize: 12, fontFamily: "sans-serif", whiteSpace: "nowrap",
              color: findResult.startsWith("✓") ? "#4ade80" : "#f87171",
            }}>
              {findResult}
            </span>
          )}
          <button className="find-btn" onClick={handleFindClick}>Find</button>
          <button className="find-btn" onClick={() => { setShowFind(false); setFindResult(""); }}>
            <X size={13} />
          </button>
        </div>
      )}
    </>
  );
}
