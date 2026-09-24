import type { CommitRecord, RepoNode } from "@/lib/github/types";

export interface RepoCommitCount {
  repo: string;
  count: number;
}

export interface LanguageDistributionEntry {
  language: string;
  color: string;
  count: number;
}

export interface DayHourCell {
  day: number;
  hour: number;
  count: number;
}

export interface TrendPoint {
  period: string;
  count: number;
}

export interface DashboardAggregates {
  commitsPerRepo: RepoCommitCount[];
  languageDistribution: LanguageDistributionEntry[];
  dayHourHeatmap: DayHourCell[];
  trend: TrendPoint[];
}

export function aggregateCommits(
  commits: CommitRecord[],
  repos: RepoNode[]
): DashboardAggregates {
  return {
    commitsPerRepo: computeCommitsPerRepo(commits),
    languageDistribution: computeLanguageDistribution(commits, repos),
    dayHourHeatmap: computeDayHourHeatmap(commits),
    trend: computeTrend(commits),
  };
}

function computeCommitsPerRepo(commits: CommitRecord[]): RepoCommitCount[] {
  const counts = new Map<string, number>();
  for (const c of commits) counts.set(c.repo, (counts.get(c.repo) ?? 0) + 1);
  return [...counts.entries()]
    .map(([repo, count]) => ({ repo, count }))
    .sort((a, b) => b.count - a.count);
}

function computeLanguageDistribution(
  commits: CommitRecord[],
  repos: RepoNode[]
): LanguageDistributionEntry[] {
  const repoLanguage = new Map(repos.map((r) => [r.nameWithOwner, r.primaryLanguage]));
  const counts = new Map<string, { color: string; count: number }>();

  for (const c of commits) {
    const lang = repoLanguage.get(c.repo);
    const name = lang?.name ?? "Unknown";
    const color = lang?.color ?? "#8b8b8b";
    const entry = counts.get(name) ?? { color, count: 0 };
    entry.count += 1;
    counts.set(name, entry);
  }

  return [...counts.entries()]
    .map(([language, { color, count }]) => ({ language, color, count }))
    .sort((a, b) => b.count - a.count);
}

function computeDayHourHeatmap(commits: CommitRecord[]): DayHourCell[] {
  const grid = new Map<string, number>();
  for (const c of commits) {
    const d = new Date(c.date);
    const key = `${d.getDay()}:${d.getHours()}`;
    grid.set(key, (grid.get(key) ?? 0) + 1);
  }

  const cells: DayHourCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({ day, hour, count: grid.get(`${day}:${hour}`) ?? 0 });
    }
  }
  return cells;
}

function computeTrend(commits: CommitRecord[]): TrendPoint[] {
  const counts = new Map<string, number>();
  for (const c of commits) {
    const d = new Date(c.date);
    const period = `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, "0")}`;
    counts.set(period, (counts.get(period) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => (a.period < b.period ? -1 : 1));
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
