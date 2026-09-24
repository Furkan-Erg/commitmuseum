"use client";

import type { ContributionCalendar } from "@/lib/github/types";
import { useGridTooltip } from "./grid-tooltip";
import { CardTitle, CardSubtitle } from "@/components/ui/card";

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

export function ContributionHeatmap({
  calendar,
}: {
  calendar: ContributionCalendar;
}) {
  const { showTooltip, hideTooltip, tooltipNode } = useGridTooltip();
  const max = Math.max(
    1,
    ...calendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
  );

  return (
    <div>
      <CardTitle>Contribution activity</CardTitle>
      <CardSubtitle>
        {calendar.totalContributions.toLocaleString()} contributions in the
        last 365 days · across all of GitHub, not limited to scanned repos
      </CardSubtitle>
      <div className="mt-4 overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          {calendar.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  className="h-[11px] w-[11px] rounded-[2px]"
                  style={{ backgroundColor: colorForCount(day.contributionCount, max) }}
                  onMouseMove={(e) =>
                    showTooltip(
                      e,
                      <>
                        <span className="font-semibold">{day.contributionCount}</span>{" "}
                        contributions on {day.date}
                      </>
                    )
                  }
                  onMouseLeave={hideTooltip}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {tooltipNode}
    </div>
  );
}
