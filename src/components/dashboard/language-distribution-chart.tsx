"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LanguageDistributionEntry } from "@/lib/data/aggregate";

const SLOT_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

function foldToTopAndOther(
  data: LanguageDistributionEntry[],
  max = 8
): LanguageDistributionEntry[] {
  if (data.length <= max) return data;
  const top = data.slice(0, max - 1);
  const rest = data.slice(max - 1);
  const otherCount = rest.reduce((sum, d) => sum + d.count, 0);
  return [...top, { language: "Other", color: "var(--text-muted)", count: otherCount }];
}

export function LanguageDistributionChart({
  data,
}: {
  data: LanguageDistributionEntry[];
}) {
  const folded = foldToTopAndOther(data);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={folded} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--grid-line)" />
          <XAxis
            dataKey="language"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--axis-line)" }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--axis-line)" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--grid-line)" }}
            contentStyle={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {folded.map((entry, index) => (
              <Cell
                key={entry.language}
                fill={index < SLOT_COLORS.length ? SLOT_COLORS[index] : "var(--text-muted)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
