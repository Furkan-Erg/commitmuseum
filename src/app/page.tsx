import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          CommitMuseum
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Your commits, on display.
        </h1>
        <p className="max-w-md text-[var(--text-secondary)]">
          Sign in with GitHub to see your contribution history as a proper
          dashboard — and dig up the funniest commit messages you&apos;ve
          ever shipped.
        </p>
        <SignInButton />
        <p className="max-w-sm text-xs text-[var(--text-muted)]">
          Nothing is stored. Every visit fetches your commit data fresh from
          GitHub and forgets it when you leave.
        </p>
      </main>
    </div>
  );
}
