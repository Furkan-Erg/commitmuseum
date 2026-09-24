import { signInWithGitHub } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <form action={signInWithGitHub}>
      <Button type="submit">Sign in with GitHub</Button>
    </form>
  );
}
