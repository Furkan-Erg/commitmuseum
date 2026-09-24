"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CommitRecord, ContributionCalendar, RepoNode } from "@/lib/github/types";
import { aggregateCommits } from "@/lib/data/aggregate";
import { detectFunnyCommits } from "@/lib/funnyCommits/detect";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RepoFilter } from "./repo-filter";
import { ContributionHeatmap } from "./contribution-heatmap";
import { CommitsPerRepoChart } from "./commits-per-repo-chart";
import { LanguageDistributionChart } from "./language-distribution-chart";
import { CommitsByDayHourChart } from "./commits-by-day-hour-chart";
import { TrendsOverTimeChart } from "./trends-over-time-chart";
import { HallOfFame } from "./hall-of-fame";

interface DashboardShellProps {
  user: { name: string; image: string | null };
  calendar: ContributionCalendar;
  repos: RepoNode[];
  totalReposAvailable: number;
  commits: CommitRecord[];
  rateLimitWarning: { remaining: number; resetAt: string } | null;
  includePrivateRepos: boolean;
}

export function DashboardShell({
  user,
  calendar,
  repos,
  totalReposAvailable,
  commits,
  rateLimitWarning,
  includePrivateRepos,
}: DashboardShellProps) {
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(
    () => new Set(repos.map((r) => r.nameWithOwner))
  );

  const filteredCommits = useMemo(
    () => commits.filter((c) => selectedRepos.has(c.repo)),
    [commits, selectedRepos]
  );

  const aggregates = useMemo(
    () => aggregateCommits(filteredCommits, repos),
    [filteredCommits, repos]
  );

  const funnyCommits = useMemo(() => detectFunnyCommits(filteredCommits), [filteredCommits]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user.image && (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">CommitMuseum</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      {rateLimitWarning && (
        <div className="rounded-md border border-[var(--status-warning)] bg-[var(--surface-1)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          GitHub API rate limit is getting low ({rateLimitWarning.remaining} requests
          left, resets {new Date(rateLimitWarning.resetAt).toLocaleTimeString()}).
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <RepoFilter repos={repos} selected={selectedRepos} onChange={setSelectedRepos} />
        <p className="text-xs text-[var(--text-muted)]">
          Scanning {repos.length} of {totalReposAvailable} repos
          {!includePrivateRepos && " (public only)"}
        </p>
      </div>

      <Card>
        <ContributionHeatmap calendar={calendar} />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Commits per repo</CardTitle>
          <CardSubtitle>Top repos by commit count, filtered selection</CardSubtitle>
          <div className="mt-4">
            <CommitsPerRepoChart data={aggregates.commitsPerRepo} />
          </div>
        </Card>
        <Card>
          <CardTitle>Language distribution</CardTitle>
          <CardSubtitle>By commits, from each repo&apos;s primary language</CardSubtitle>
          <div className="mt-4">
            <LanguageDistributionChart data={aggregates.languageDistribution} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>When you commit</CardTitle>
          <CardSubtitle>Day of week × hour of day</CardSubtitle>
          <div className="mt-4">
            <CommitsByDayHourChart data={aggregates.dayHourHeatmap} />
          </div>
        </Card>
        <Card>
          <CardTitle>Commits over time</CardTitle>
          <CardSubtitle>Weekly totals</CardSubtitle>
          <div className="mt-4">
            <TrendsOverTimeChart data={aggregates.trend} />
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Hall of Fame</CardTitle>
        <CardSubtitle>Your own commit messages, flagged for comic value</CardSubtitle>
        <div className="mt-4">
          <HallOfFame commits={funnyCommits} />
        </div>
      </Card>
    </div>
  );
}
