import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const includePrivateRepos = process.env.INCLUDE_PRIVATE_REPOS === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // Deliberately no "repo" scope by default — it grants read/write
          // access to all private repo code, which is far more than a
          // commit-stats dashboard needs. Only requested when the deployer
          // opts in via INCLUDE_PRIVATE_REPOS, and doing so requires users
          // to re-consent on their next sign-in.
          scope: includePrivateRepos ? "read:user repo" : "read:user",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
