import pLimit from "p-limit";
import { githubRestFetch, type RateLimitInfo } from "./client";
import type { CommitRecord, RepoNode } from "./types";

const MAX_REPOS_TO_SCAN = Number(process.env.MAX_REPOS_TO_SCAN ?? 15);
const MAX_COMMITS_PER_REPO = Number(process.env.MAX_COMMITS_PER_REPO ?? 200);
const GITHUB_API_CONCURRENCY = Number(process.env.GITHUB_API_CONCURRENCY ?? 5);
const PER_PAGE = 100;

interface RawCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string } | null;
  };
}

export function selectReposToScan(
  repos: RepoNode[],
  includePrivate: boolean
): RepoNode[] {
  return repos
    .filter((repo) => !repo.isFork)
    .filter((repo) => includePrivate || !repo.isPrivate)
    .slice(0, MAX_REPOS_TO_SCAN);
}

async function fetchCommitsForRepo(
  accessToken: string,
  login: string,
  repo: RepoNode
): Promise<{ commits: CommitRecord[]; rateLimit: RateLimitInfo | null }> {
  const pagesNeeded = Math.ceil(MAX_COMMITS_PER_REPO / PER_PAGE);
  const commits: CommitRecord[] = [];
  let lastRateLimit: RateLimitInfo | null = null;

  for (let page = 1; page <= pagesNeeded; page++) {
    const remaining = MAX_COMMITS_PER_REPO - commits.length;
    if (remaining <= 0) break;
    const perPage = Math.min(PER_PAGE, remaining);

    let raw: RawCommit[];
    try {
      const { data, rateLimit } = await githubRestFetch(
        accessToken,
        `/repos/${repo.nameWithOwner}/commits?author=${encodeURIComponent(
          login
        )}&per_page=${perPage}&page=${page}`
      );
      lastRateLimit = rateLimit ?? lastRateLimit;
      raw = data as RawCommit[];
    } catch {
      // Empty repos, repos with zero commits by this author, or a
      // transient GitHub error shouldn't blow up the whole dashboard —
      // just skip this repo's remaining pages.
      break;
    }

    if (raw.length === 0) break;

    for (const item of raw) {
      commits.push({
        sha: item.sha,
        message: item.commit.message.split("\n")[0],
        date: item.commit.author?.date ?? new Date(0).toISOString(),
        url: item.html_url,
        repo: repo.nameWithOwner,
      });
    }

    if (raw.length < perPage) break;
  }

  return { commits, rateLimit: lastRateLimit };
}

export async function fetchCommitsForRepos(
  accessToken: string,
  login: string,
  repos: RepoNode[]
): Promise<{ commits: CommitRecord[]; rateLimit: RateLimitInfo | null }> {
  const limit = pLimit(GITHUB_API_CONCURRENCY);
  const results = await Promise.all(
    repos.map((repo) => limit(() => fetchCommitsForRepo(accessToken, login, repo)))
  );

  const commits = results.flatMap((r) => r.commits);
  const rateLimit =
    results
      .map((r) => r.rateLimit)
      .filter((r): r is RateLimitInfo => r !== null)
      .sort((a, b) => a.remaining - b.remaining)[0] ?? null;

  return { commits, rateLimit };
}
