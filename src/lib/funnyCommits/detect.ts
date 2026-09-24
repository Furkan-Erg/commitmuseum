import type { CommitRecord } from "@/lib/github/types";
import { FUNNY_RULES } from "./rules";

export interface ScoredCommit extends CommitRecord {
  funnyScore: number;
  matchedRules: string[];
}

const FUNNY_THRESHOLD = 3;
const MAX_RESULTS = 20;

export function detectFunnyCommits(commits: CommitRecord[]): ScoredCommit[] {
  const scored: ScoredCommit[] = commits.map((commit) => {
    const matchedRules: string[] = [];
    let funnyScore = 0;
    for (const rule of FUNNY_RULES) {
      if (rule.test(commit.message)) {
        matchedRules.push(rule.label);
        funnyScore += rule.weight;
      }
    }
    return { ...commit, funnyScore, matchedRules };
  });

  return scored
    .filter((c) => c.funnyScore >= FUNNY_THRESHOLD)
    .sort((a, b) => b.funnyScore - a.funnyScore)
    .slice(0, MAX_RESULTS);
}
