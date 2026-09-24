import type { ScoredCommit } from "@/lib/funnyCommits/detect";
import { Badge } from "@/components/ui/badge";

export function HallOfFame({ commits }: { commits: ScoredCommit[] }) {
  if (commits.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No suspiciously funny commit messages found in this selection —
        either very disciplined, or very boring.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--grid-line)]">
      {commits.map((commit) => (
        <li key={commit.sha} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
          <a
            href={commit.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[var(--text-primary)] hover:underline"
          >
            {commit.message}
          </a>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>{commit.repo}</span>
            <span aria-hidden>·</span>
            <span>{new Date(commit.date).toLocaleDateString()}</span>
            {commit.matchedRules.map((rule) => (
              <Badge key={rule}>{rule}</Badge>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
