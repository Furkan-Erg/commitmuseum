export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface RepoNode {
  name: string;
  nameWithOwner: string;
  primaryLanguage: { name: string; color: string | null } | null;
  pushedAt: string;
  isPrivate: boolean;
  isFork: boolean;
}

export interface ViewerOverviewResult {
  viewer: {
    login: string;
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
    repositories: {
      nodes: RepoNode[];
    };
  };
}

export interface CommitRecord {
  sha: string;
  message: string;
  /** ISO 8601 commit date (author date) */
  date: string;
  url: string;
  /** "owner/name" */
  repo: string;
}
