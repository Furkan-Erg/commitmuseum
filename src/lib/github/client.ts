import { GraphQLClient } from "graphql-request";
import { withMemo } from "./cache";
import { VIEWER_OVERVIEW_QUERY } from "./queries";
import type { ViewerOverviewResult } from "./types";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const GITHUB_REST_ENDPOINT = "https://api.github.com";

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

export function readRateLimit(headers: Headers): RateLimitInfo | null {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-limit");
  const reset = headers.get("x-ratelimit-reset");
  if (remaining === null || limit === null || reset === null) return null;
  return {
    remaining: Number(remaining),
    limit: Number(limit),
    resetAt: new Date(Number(reset) * 1000),
  };
}

export async function fetchViewerOverview(
  accessToken: string,
  fromISO: string,
  toISO: string
): Promise<ViewerOverviewResult> {
  return withMemo(`overview:${accessToken}:${fromISO}:${toISO}`, async () => {
    const client = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return client.request<ViewerOverviewResult>(VIEWER_OVERVIEW_QUERY, {
      from: fromISO,
      to: toISO,
    });
  });
}

export async function githubRestFetch(
  accessToken: string,
  path: string
): Promise<{ data: unknown; rateLimit: RateLimitInfo | null }> {
  const response = await fetch(`${GITHUB_REST_ENDPOINT}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  const rateLimit = readRateLimit(response.headers);

  if (!response.ok) {
    throw new Error(`GitHub REST request failed (${response.status}): ${path}`);
  }

  const data = await response.json();
  return { data, rateLimit };
}
