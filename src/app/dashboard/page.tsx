import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { fetchViewerOverview } from "@/lib/github/client";
import { selectReposToScan, fetchCommitsForRepos } from "@/lib/github/rest";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const includePrivateRepos = process.env.INCLUDE_PRIVATE_REPOS === "true";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.accessToken) {
    redirect("/");
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 365);

  const overview = await fetchViewerOverview(
    session.accessToken,
    from.toISOString(),
    to.toISOString()
  );

  const login = overview.viewer.login;
  const allRepos = overview.viewer.repositories.nodes;
  const scannedRepos = selectReposToScan(allRepos, includePrivateRepos);

  const { commits, rateLimit } = await fetchCommitsForRepos(
    session.accessToken,
    login,
    scannedRepos
  );

  return (
    <DashboardShell
      user={{
        name: session.user?.name ?? login,
        image: session.user?.image ?? null,
      }}
      calendar={overview.viewer.contributionsCollection.contributionCalendar}
      repos={scannedRepos}
      totalReposAvailable={allRepos.length}
      commits={commits}
      rateLimitWarning={
        rateLimit && rateLimit.remaining < 200
          ? { remaining: rateLimit.remaining, resetAt: rateLimit.resetAt.toISOString() }
          : null
      }
      includePrivateRepos={includePrivateRepos}
    />
  );
}
