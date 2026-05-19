import { ReactNode } from "react";

export function IconButton({
  icon, onClick, activated, label, shortcut, disabled
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={label && shortcut ? `${label} (${shortcut})` : label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        background: activated ? "rgba(99,102,241,0.25)" : "transparent",
        border: activated ? "1px solid rgba(99,102,241,0.6)" : "1px solid transparent",
        color: activated ? "#a5b4fc" : "rgba(255,255,255,0.75)",
        transition: "all 0.15s",
        position: "relative",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (!activated && !disabled)
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={e => {
        if (!activated)
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {icon}
      {shortcut && (
        <span style={{
          position: "absolute",
          bottom: 2,
          right: 4,
          fontSize: 8,
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
          lineHeight: 1,
        }}>
          {shortcut}
        </span>
      )}
    </div>
  );
}