export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--text-muted)]">
        Fetching your commit history from GitHub…
      </p>
    </div>
  );
}
