import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { TutorialDebugInfo } from "../../hooks/useTutorial";

type Props = { info: TutorialDebugInfo | null };

const rectStyle = (top: number, left: number, width: number, height: number, color: string): CSSProperties => ({
  position: "fixed",
  top,
  left,
  width,
  height,
  border: `2px dashed ${color}`,
  boxSizing: "border-box",
  pointerEvents: "none",
  zIndex: 9999,
});

const labelStyle = (top: number, left: number, color: string): CSSProperties => ({
  position: "fixed",
  top,
  left,
  padding: "2px 6px",
  background: color,
  color: "#fff",
  font: "11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace",
  borderRadius: 4,
  pointerEvents: "none",
  zIndex: 10000,
  whiteSpace: "nowrap",
});

const spaceLineStyle = (
  side: "top" | "bottom" | "left" | "right",
  t: TutorialDebugInfo["target"],
  vw: number,
  vh: number,
  fits: boolean,
): { line: CSSProperties; label: CSSProperties; text: string } => {
  const color = fits ? "rgba(34, 197, 94, 0.95)" : "rgba(239, 68, 68, 0.95)";
  const cx = t.left + t.width / 2;
  const cy = t.top + t.height / 2;
  const thickness = 2;
  switch (side) {
    case "top": {
      return {
        line: {
          position: "fixed",
          left: cx - thickness / 2,
          top: 0,
          width: thickness,
          height: t.top,
          background: color,
          pointerEvents: "none",
          zIndex: 9998,
        },
        label: labelStyle(t.top / 2 - 10, cx + 6, color),
        text: `top ${Math.round(t.top)}px`,
      };
    }
    case "bottom": {
      const start = t.bottom;
      const h = vh - t.bottom;
      return {
        line: {
          position: "fixed",
          left: cx - thickness / 2,
          top: start,
          width: thickness,
          height: h,
          background: color,
          pointerEvents: "none",
          zIndex: 9998,
        },
        label: labelStyle(start + h / 2 - 10, cx + 6, color),
        text: `bottom ${Math.round(h)}px`,
      };
    }
    case "left": {
      return {
        line: {
          position: "fixed",
          top: cy - thickness / 2,
          left: 0,
          height: thickness,
          width: t.left,
          background: color,
          pointerEvents: "none",
          zIndex: 9998,
        },
        label: labelStyle(cy - 22, t.left / 2 - 30, color),
        text: `left ${Math.round(t.left)}px`,
      };
    }
    case "right": {
      const start = t.right;
      const w = vw - t.right;
      return {
        line: {
          position: "fixed",
          top: cy - thickness / 2,
          left: start,
          height: thickness,
          width: w,
          background: color,
          pointerEvents: "none",
          zIndex: 9998,
        },
        label: labelStyle(cy - 22, start + w / 2 - 30, color),
        text: `right ${Math.round(w)}px`,
      };
    }
  }
};

const panelStyle: CSSProperties = {
  position: "fixed",
  bottom: 16,
  left: 16,
  zIndex: 10001,
  padding: "10px 12px",
  background: "rgba(15, 23, 42, 0.92)",
  color: "#e2e8f0",
  font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  pointerEvents: "none",
  maxWidth: 360,
};

export default function TutorialDebugOverlay({ info }: Props) {
  if (!info) return null;
  const { target, popover, viewport, spacePx, fits, chosen, requested, offset, overflow, targetDescriptor } = info;

  const sides: Array<"top" | "bottom" | "left" | "right"> = ["top", "bottom", "left", "right"];

  return createPortal(
    <>
      {/* Target rect */}
      <div style={rectStyle(target.top, target.left, target.width, target.height, "rgba(59, 130, 246, 0.95)")} />
      <div style={labelStyle(target.top - 18, target.left, "rgba(59, 130, 246, 0.95)")}>target</div>

      {/* Popover rect */}
      <div style={rectStyle(popover.top, popover.left, popover.width, popover.height, "rgba(168, 85, 247, 0.95)")} />
      <div style={labelStyle(popover.top - 18, popover.left, "rgba(168, 85, 247, 0.95)")}>popover ({chosen})</div>

      {/* Space lines on 4 sides */}
      {sides.map((s) => {
        const { line, label, text } = spaceLineStyle(s, target, viewport.width, viewport.height, fits[s]);
        return (
          <div key={s}>
            <div style={line} />
            <div style={label}>{text}{s === chosen ? "  ◀ chosen" : ""}</div>
          </div>
        );
      })}

      {/* Info panel */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>useTutorial debug</div>
        <div>requested: {requested}  →  chosen: {chosen}</div>
        <div style={{ color: "#fbbf24", wordBreak: "break-all" }}>matched: {targetDescriptor}</div>
        <div>viewport: {viewport.width} × {viewport.height}</div>
        <div>target: {Math.round(target.width)} × {Math.round(target.height)} @ ({Math.round(target.left)}, {Math.round(target.top)})</div>
        <div>popover: {popover.width} × {popover.height} @ ({Math.round(popover.left)}, {Math.round(popover.top)})</div>
        <div>offset: x={offset.x} y={offset.y}</div>
        <div style={{ marginTop: 4 }}>space (px):</div>
        {sides.map((s) => (
          <div key={s} style={{ paddingLeft: 8, color: fits[s] ? "#86efac" : "#fca5a5" }}>
            {s.padEnd(7)}{Math.round(spacePx[s]).toString().padStart(5)}  fits={String(fits[s])}
            {s === chosen ? "  ◀" : ""}
          </div>
        ))}
        <div style={{ marginTop: 4 }}>overflow:</div>
        {sides.map((s) => (
          <div key={s} style={{ paddingLeft: 8, color: overflow[s] > 0 ? "#fca5a5" : "#94a3b8" }}>
            {s.padEnd(7)}{Math.round(overflow[s]).toString().padStart(5)}
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}
