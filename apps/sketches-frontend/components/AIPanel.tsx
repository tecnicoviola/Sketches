"use client";

import { useState, useRef } from "react";
import { X, Wand2, Code2, GitBranch, Send, Loader2, Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsertShapes: (shapes: any[]) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

type Tab = "text-to-diagram" | "mermaid" | "wireframe";

export function AIPanel({ open, onClose, onInsertShapes, canvasRef }: Props) {
  const [tab, setTab] = useState<Tab>("text-to-diagram");
  const [prompt, setPrompt] = useState("");
  const [mermaidCode, setMermaidCode] = useState("flowchart TD\n  A[Start] --> B[Process]\n  B --> C{Decision}\n  C -->|Yes| D[Done]\n  C -->|No| B");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatedShapes, setGeneratedShapes] = useState<any[]>([]);

  async function handleTextToDiagram() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/text-to-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.shapes?.length > 0) {
        setGeneratedShapes(data.shapes);
      } else {
        setError("Could not generate diagram. Try a more specific description.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMermaid() {
    if (!mermaidCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mermaid-to-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mermaid: mermaidCode }),
      });
      const data = await res.json();
      if (data.shapes?.length > 0) {
        setGeneratedShapes(data.shapes);
      } else {
        setError("Could not parse Mermaid diagram.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWireframeToCode() {
    if (!canvasRef.current) return;
    setLoading(true);
    setError("");
    setGeneratedCode("");
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL("image/png");
      const base64 = dataURL.split(",")[1]!;

      const res = await fetch("/api/wireframe-to-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      setGeneratedCode(data.code || "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (generatedShapes.length > 0) {
      onInsertShapes(generatedShapes);
      setGeneratedShapes([]);
      onClose();
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenInBrowser() {
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        .ai-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 480px;
          height: 100vh;
          background: #1e1e24;
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 400;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0,0,0,0.5);
          animation: slideIn 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .ai-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ai-panel-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          font-family: sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ai-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 2px 7px;
          border-radius: 20px;
        }
        .ai-tabs {
          display: flex;
          gap: 0;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ai-tab {
          padding: 12px 16px;
          font-size: 12.5px;
          font-family: sans-serif;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .ai-tab.active {
          color: #a78bfa;
          border-bottom-color: #a78bfa;
        }
        .ai-tab:hover:not(.active) {
          color: rgba(255,255,255,0.7);
        }
        .ai-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ai-body::-webkit-scrollbar { width: 4px; }
        .ai-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .ai-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
          padding: 40px 20px;
        }
        .ai-empty h3 {
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          font-family: sans-serif;
        }
        .ai-empty p {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          font-family: sans-serif;
          line-height: 1.6;
          max-width: 320px;
        }
        .ai-textarea {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 14px 16px;
          color: rgba(255,255,255,0.85);
          font-size: 13.5px;
          font-family: 'Courier New', monospace;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          min-height: 120px;
          line-height: 1.6;
        }
        .ai-textarea:focus {
          border-color: rgba(167,139,250,0.5);
          background: rgba(255,255,255,0.07);
        }
        .ai-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .ai-send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          font-family: sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
        }
        .ai-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.5);
        }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-preview {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 16px;
        }
        .ai-preview-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-family: sans-serif;
          margin-bottom: 10px;
        }
        .ai-preview-shapes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ai-shape-chip {
          font-size: 11px;
          font-family: sans-serif;
          color: rgba(255,255,255,0.6);
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.2);
          padding: 3px 10px;
          border-radius: 20px;
        }
        .ai-insert-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: #F0ECDD;
          color: #1b1b1f;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          font-family: sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .ai-insert-btn:hover {
          background: #e8e4d5;
          transform: translateY(-1px);
        }
        .ai-code-block {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
        }
        .ai-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
        }
        .ai-code-lang {
          font-size: 11px;
          font-family: monospace;
          color: rgba(255,255,255,0.3);
        }
        .ai-code-actions {
          display: flex;
          gap: 8px;
        }
        .ai-code-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          font-family: sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-code-btn:hover {
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.9);
        }
        .ai-code-pre {
          padding: 16px;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .ai-error {
          font-size: 12.5px;
          color: #f87171;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          font-family: sans-serif;
        }
        .mermaid-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .ai-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-family: sans-serif;
          margin-bottom: 6px;
        }
      `}</style>

      <div className="ai-panel">
        {/* Header */}
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <Wand2 size={16} color="#a78bfa" />
            Generate
            <span className="ai-badge">AI</span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.4)",
            cursor: "pointer", display: "flex", alignItems: "center", padding: 4,
            borderRadius: 6, transition: "all 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="ai-tabs">
          <div className={`ai-tab ${tab === "text-to-diagram" ? "active" : ""}`} onClick={() => { setTab("text-to-diagram"); setError(""); setGeneratedShapes([]); }}>
            <Wand2 size={13} /> Text to diagram
          </div>
          <div className={`ai-tab ${tab === "mermaid" ? "active" : ""}`} onClick={() => { setTab("mermaid"); setError(""); setGeneratedShapes([]); }}>
            <GitBranch size={13} /> Mermaid
          </div>
          <div className={`ai-tab ${tab === "wireframe" ? "active" : ""}`} onClick={() => { setTab("wireframe"); setError(""); setGeneratedCode(""); }}>
            <Code2 size={13} /> Wireframe to code
          </div>
        </div>

        {/* Body */}
        <div className="ai-body">

          {/* ── TEXT TO DIAGRAM ── */}
          {tab === "text-to-diagram" && (
            <>
              {generatedShapes.length === 0 ? (
                <div className="ai-empty">
                  <div style={{ fontSize: 40 }}>✦</div>
                  <h3>Let's design your diagram</h3>
                  <p>Describe the diagram you want to create, and we'll generate it for you. We support Flowcharts, Sequence, Class, State, and Entity Relationship diagrams.</p>
                </div>
              ) : (
                <div className="ai-preview">
                  <div className="ai-preview-title">Generated — {generatedShapes.length} shapes</div>
                  <div className="ai-preview-shapes">
                    {generatedShapes.map((s, i) => (
                      <span key={i} className="ai-shape-chip">{s.type}</span>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="ai-error">{error}</div>}

              {generatedShapes.length > 0 && (
                <button className="ai-insert-btn" onClick={handleInsert}>
                  Insert → <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 4 }}>Ctrl+Enter</span>
                </button>
              )}

              <div style={{ marginTop: "auto" }}>
                <div className="ai-label">Describe your diagram</div>
                <div style={{ position: "relative" }}>
                  <textarea
                    className="ai-textarea"
                    placeholder="Start typing your diagram idea here... (Shift + Enter for new line)"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextToDiagram(); }
                    }}
                    rows={4}
                  />
                </div>
                <button className="ai-send-btn" style={{ width: "100%", marginTop: 10 }} onClick={handleTextToDiagram} disabled={loading || !prompt.trim()}>
                  {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Generating…</> : <><Send size={14} />Generate diagram</>}
                </button>
              </div>
            </>
          )}

          {/* ── MERMAID ── */}
          {tab === "mermaid" && (
            <>
              <div className="mermaid-split">
                <div>
                  <div className="ai-label">Mermaid code</div>
                  <textarea
                    className="ai-textarea"
                    value={mermaidCode}
                    onChange={e => setMermaidCode(e.target.value)}
                    rows={10}
                    placeholder="flowchart TD&#10;  A[Start] --> B[Process]&#10;  B --> C{Decision}&#10;  C -->|Yes| D[Done]&#10;  C -->|No| B"
                    spellCheck={false}
                  />
                </div>
              </div>

              {error && <div className="ai-error">{error}</div>}

              {generatedShapes.length > 0 && (
                <>
                  <div className="ai-preview">
                    <div className="ai-preview-title">Ready — {generatedShapes.length} shapes</div>
                    <div className="ai-preview-shapes">
                      {generatedShapes.map((s, i) => (
                        <span key={i} className="ai-shape-chip">{s.type}</span>
                      ))}
                    </div>
                  </div>
                  <button className="ai-insert-btn" onClick={handleInsert}>
                    Insert → <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 4 }}>Ctrl+Enter</span>
                  </button>
                </>
              )}

              <button className="ai-send-btn" onClick={handleMermaid} disabled={loading || !mermaidCode.trim()}>
                {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Converting…</> : <><GitBranch size={14} />Convert to diagram</>}
              </button>
            </>
          )}

          {/* ── WIREFRAME TO CODE ── */}
          {tab === "wireframe" && (
            <>
              {!generatedCode ? (
                <div className="ai-empty">
                  <div style={{ fontSize: 40 }}>⟨/⟩</div>
                  <h3>Wireframe to code</h3>
                  <p>Draw your wireframe on the canvas, then click the button below. Claude AI will convert your sketch into clean HTML and CSS code.</p>
                </div>
              ) : (
                <div className="ai-code-block">
                  <div className="ai-code-header">
                    <span className="ai-code-lang">HTML + CSS</span>
                    <div className="ai-code-actions">
                      <button className="ai-code-btn" onClick={handleCopyCode}>
                        {copied ? <><Check size={11} />Copied!</> : <><Copy size={11} />Copy</>}
                      </button>
                      <button className="ai-code-btn" onClick={handleOpenInBrowser}>
                        ↗ Preview
                      </button>
                    </div>
                  </div>
                  <pre className="ai-code-pre">{generatedCode}</pre>
                </div>
              )}

              {error && <div className="ai-error">{error}</div>}

              <button className="ai-send-btn" onClick={handleWireframeToCode} disabled={loading} style={{ marginTop: "auto" }}>
                {loading
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Analyzing canvas…</>
                  : <><Code2 size={14} />Convert canvas to code</>
                }
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}