"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Search, BookOpen, MessageSquare, Presentation, 
  Plus, MoreVertical, Pin, ChevronDown, ChevronUp, 
  FolderOpen, Download, Trash2 
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type SidebarTab = "search" | "library" | "comments" | "presentation";

// Mock data representing text nodes on the canvas for search functionality
const CANVAS_TEXT_NODES = [
  "eufhawuifuawnfkjawsfaw",
  "tyu",
  "jneijden",
  "hello world",
  "React component",
  "WebSocket connection"
];

export function RightSidebar({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [showLibMenu, setShowLibMenu] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(true);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close library dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLibMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlusSignup = () => {
    window.location.href = "/sketches-plus";
  };

  if (!open) return null;

  const matchedSearchTexts = CANVAS_TEXT_NODES.filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        .right-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 340px;
          height: 100vh;
          background: #232329;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 450;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
          font-family: sans-serif;
          animation: slideFromRight 0.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes slideFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .sidebar-header-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .tab-cluster {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
        }
        .tab-trigger {
          background: none;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .tab-trigger.active {
          background: #3b3b44;
          color: #a5b4fc;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .action-icon-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .action-icon-btn:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }
        .action-icon-btn.pinned {
          color: #a5b4fc;
        }
        .sidebar-body-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sidebar-body-viewport::-webkit-scrollbar { width: 4px; }
        .sidebar-body-viewport::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .search-icon-left {
          position: absolute;
          left: 10px;
          color: rgba(255, 255, 255, 0.4);
        }
        .sidebar-search-bar {
          width: 100%;
          background: #1c1c21;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 12px 10px 36px;
          color: #fff;
          font-size: 13px;
          outline: none;
        }
        .sidebar-search-bar:focus { border-color: #a5b4fc; }
        
        .sidebar-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #a5b4fc;
          margin-top: 8px;
        }
        
        /* Dropdown Menu CSS */
        .lib-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: #232329;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          min-width: 160px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 500;
        }
        .lib-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          font-family: sans-serif;
          transition: background 0.15s;
        }
        .lib-menu-item:hover { background: rgba(255, 255, 255, 0.08); }

        /* Search Results CSS */
        .search-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-top: 10px;
        }
        .search-result-category {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          margin: 12px 0 8px;
        }
        .search-result-item {
          background: #2c2c35;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 6px;
          word-break: break-all;
        }
        .search-result-item:hover { background: #35353f; }
        .search-highlight { font-weight: bold; color: #a5b4fc; }
        
        .no-results-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 30px 0;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
        }
        .clear-search-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .clear-search-btn:hover { background: rgba(255,255,255,0.1); }

        .placeholder-add-card {
          width: 36px;
          height: 36px;
          background: #a5b4fc;
          color: #111;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.1s;
        }
        .placeholder-add-card:hover { transform: scale(1.05); }

        .cta-box-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px;
          gap: 16px;
        }
        .cta-headline {
          font-size: 15px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }
        .cta-purple-btn {
          background: #a5b4fc;
          color: #1c1c21;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cta-purple-btn:hover { background: #93c5fd; }
        
        .mock-comment-thread {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          text-align: left;
        }
        .mock-comment {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
        }
        .comment-meta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 4px;
        }
        .comment-author { font-weight: 600; color: rgba(255, 255, 255, 0.7); }
        .comment-text { font-size: 13px; color: rgba(255, 255, 255, 0.5); }
      `}</style>

      <div className="right-sidebar">
        {/* Header containing Navigation Clusters */}
        <div className="sidebar-header-nav">
          <div className="tab-cluster">
            <button className={`tab-trigger ${activeTab === "search" ? "active" : ""}`} onClick={() => setActiveTab("search")} title="Search">
              <Search size={15} />
            </button>
            <button className={`tab-trigger ${activeTab === "library" ? "active" : ""}`} onClick={() => setActiveTab("library")} title="Personal Library">
              <BookOpen size={15} />
            </button>
            <button className={`tab-trigger ${activeTab === "comments" ? "active" : ""}`} onClick={() => setActiveTab("comments")} title="Comments">
              <MessageSquare size={15} />
            </button>
            <button className={`tab-trigger ${activeTab === "presentation" ? "active" : ""}`} onClick={() => setActiveTab("presentation")} title="Presentation Mode">
              <Presentation size={15} />
            </button>
          </div>

          <div className="header-actions">
            {/* PIN BUTTON FIX: Filled state when pinned */}
            <button className={`action-icon-btn ${isPinned ? "pinned" : ""}`} onClick={() => setIsPinned(!isPinned)}>
              <Pin size={14} fill={isPinned ? "currentColor" : "none"} />
            </button>
            <button className="action-icon-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Inner Body Context Viewport */}
        <div className="sidebar-body-viewport">
          
          {/* ── SEARCH SUB-PANEL ── */}
          {activeTab === "search" && (
            <>
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon-left" />
                <input 
                  type="text" 
                  className="sidebar-search-bar" 
                  placeholder="Search canvas assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {!searchQuery ? (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "20px" }}>
                  Type to query layers or custom structural nodes...
                </div>
              ) : matchedSearchTexts.length > 0 ? (
                <div>
                  <div className="search-result-header">
                    <span>{matchedSearchTexts.length} / {matchedSearchTexts.length} result{matchedSearchTexts.length !== 1 ? 's' : ''}</span>
                    <button className="action-icon-btn" onClick={() => setSearchExpanded(!searchExpanded)} style={{ padding: 2 }}>
                      {searchExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  
                  {searchExpanded && (
                    <>
                      <div className="search-result-category">
                        <span>A</span> Texts
                      </div>
                      {matchedSearchTexts.map((text, idx) => {
                        // Bold the matched portion
                        const matchIndex = text.toLowerCase().indexOf(searchQuery.toLowerCase());
                        const beforeStr = text.substring(0, matchIndex);
                        const matchStr = text.substring(matchIndex, matchIndex + searchQuery.length);
                        const afterStr = text.substring(matchIndex + searchQuery.length);
                        
                        return (
                          <div key={idx} className="search-result-item">
                            {beforeStr}<span className="search-highlight">{matchStr}</span>{afterStr}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              ) : (
                <div className="no-results-box">
                  No matching items found...
                  <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PERSONAL LIBRARY SUB-PANEL ── */}
          {activeTab === "library" && (
            <>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                  type="text" 
                  className="sidebar-search-bar" 
                  placeholder="Search library..." 
                  style={{ flex: 1 }} 
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                />
                
                {/* LIBRARY DROPDOWN MENU FIX */}
                <div style={{ position: "relative" }} ref={menuRef}>
                  <button 
                    className="action-icon-btn" 
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                    onClick={() => setShowLibMenu(!showLibMenu)}
                  >
                    <MoreVertical size={14} />
                  </button>

                  {showLibMenu && (
                    <div className="lib-dropdown-menu">
                      <div className="lib-menu-item" onClick={() => setShowLibMenu(false)}>
                        <FolderOpen size={14} /> Open
                      </div>
                      <div className="lib-menu-item" onClick={() => setShowLibMenu(false)}>
                        <Download size={14} /> Save to...
                      </div>
                      <div className="lib-menu-item" onClick={() => setShowLibMenu(false)}>
                        <Trash2 size={14} /> Reset library
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!libraryQuery ? (
                <>
                  <div className="sidebar-section-title">Personal Library</div>
                  <div style={{ display: "flex", padding: "10px 0" }}>
                    <div className="placeholder-add-card">
                      <Plus size={16} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-results-box">
                  No matching items found...
                  <button className="clear-search-btn" onClick={() => setLibraryQuery("")}>
                    Clear search
                  </button>
                </div>
              )}

              <button className="cta-purple-btn" style={{ marginTop: "auto", width: "100%" }}>
                Browse libraries
              </button>
            </>
          )}

          {/* ── COMMENT FEED SUB-PANEL ── */}
          {activeTab === "comments" && (
            <div className="cta-box-center">
              <div className="mock-comment-thread">
                <div className="mock-comment">
                  <div className="comment-meta"><span className="comment-author">Robb</span> • 1 hour ago</div>
                  <div className="comment-text">What do you guys think about this one?</div>
                </div>
                <div className="mock-comment">
                  <div className="comment-meta"><span className="comment-author">Aemon</span> • 5 hours ago</div>
                  <div className="comment-text">We should be able to make it work...</div>
                </div>
              </div>
              <div className="cta-headline" style={{ marginTop: "12px" }}>
                Make comments with Sketches+
              </div>
              <button className="cta-purple-btn" onClick={handlePlusSignup}>
                Sign up now
              </button>
            </div>
          )}

          {/* ── PRESENTATION MODE SUB-PANEL ── */}
          {activeTab === "presentation" && (
            <div className="cta-box-center">
              <svg width="120" height="90" viewBox="0 0 120 90" fill="none" style={{ opacity: 0.25, marginBottom: "8px" }}>
                <rect x="10" y="10" width="100" height="60" rx="4" stroke="white" strokeWidth="2" />
                <polygon points="52,32 52,48 68,40" fill="white" />
                <line x1="30" y1="80" x2="90" y2="80" stroke="white" strokeWidth="2" />
                <line x1="60" y1="70" x2="60" y2="80" stroke="white" strokeWidth="2" />
              </svg>
              <div className="cta-headline">
                Create presentations with Sketches+
              </div>
              <button className="cta-purple-btn" onClick={handlePlusSignup}>
                Sign up now
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}