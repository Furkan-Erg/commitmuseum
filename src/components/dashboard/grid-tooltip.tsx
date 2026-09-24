"use client";

import { useState, type ReactNode, type MouseEvent } from "react";

interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

export function useGridTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  function showTooltip(e: MouseEvent, content: ReactNode) {
    setTooltip({ x: e.clientX, y: e.clientY, content });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  const tooltipNode = tooltip ? (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 rounded-md border border-[var(--border-hairline)] bg-[var(--surface-1)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-md"
      style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
    >
      {tooltip.content}
    </div>
  ) : null;

  return { showTooltip, hideTooltip, tooltipNode };
}
