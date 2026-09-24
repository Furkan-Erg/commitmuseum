"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RepoCommitCount } from "@/lib/data/aggregate";

export function CommitsPerRepoChart({ data }: { data: RepoCommitCount[] }) {
  const top = data.slice(0, 10);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top}
          layout="vertical"
          margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--grid-line)" />
          <XAxis
            type="number"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--axis-line)" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="repo"
            width={140}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--axis-line)" }}
            tickFormatter={(value: string) => value.split("/")[1] ?? value}
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
          <Bar dataKey="count" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
