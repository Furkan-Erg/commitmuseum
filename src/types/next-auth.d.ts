import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /**
     * GitHub OAuth access token. Only ever read server-side via `auth()`
     * (Server Components / Server Actions / Route Handlers). Never forward
     * the `session` object, or this field, as a prop into a Client
     * Component — that would ship the token into the browser bundle.
     */
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
