"use client";

import { Fragment } from "react";
import type { DayHourCell } from "@/lib/data/aggregate";
import { useGridTooltip } from "./grid-tooltip";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SEQUENTIAL_STEPS = [
  "var(--seq-100)",
  "var(--seq-200)",
  "var(--seq-300)",
  "var(--seq-400)",
  "var(--seq-500)",
  "var(--seq-600)",
  "var(--seq-700)",
];

function colorForCount(count: number, max: number): string {
  if (count === 0) return "var(--grid-line)";
  if (max === 0) return SEQUENTIAL_STEPS[0];
  const ratio = count / max;
  const index = Math.min(
    SEQUENTIAL_STEPS.length - 1,
    Math.floor(ratio * SEQUENTIAL_STEPS.length)
  );
  return SEQUENTIAL_STEPS[index];
}

export function CommitsByDayHourChart({ data }: { data: DayHourCell[] }) {
  const { showTooltip, hideTooltip, tooltipNode } = useGridTooltip();
  const max = Math.max(1, ...data.map((c) => c.count));
  const grid = new Map(data.map((c) => [`${c.day}:${c.hour}`, c.count]));

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-[3px]"
        style={{ gridTemplateColumns: "32px repeat(24, 14px)" }}
      >
        <div />
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="text-center text-[9px] text-[var(--text-muted)]">
            {hour % 3 === 0 ? hour : ""}
          </div>
        ))}
        {DAY_LABELS.map((label, day) => (
          <Fragment key={day}>
            <div className="flex items-center text-[10px] text-[var(--text-muted)]">
              {label}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const count = grid.get(`${day}:${hour}`) ?? 0;
              return (
                <div
                  key={hour}
                  className="h-[14px] w-[14px] rounded-[2px]"
                  style={{ backgroundColor: colorForCount(count, max) }}
                  onMouseMove={(e) =>
                    showTooltip(
                      e,
                      <>
                        <span className="font-semibold">{count}</span> commits ·{" "}
                        {label} {hour}:00
                      </>
                    )
                  }
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
      {tooltipNode}
    </div>
  );
}
