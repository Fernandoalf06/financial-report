import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth config (no Prisma / Node.js APIs).
 * This is imported by middleware.ts which runs on the Edge Runtime.
 * The full auth.ts imports this and adds the Prisma-dependent authorize logic.
 */
export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // authorize is defined in auth.ts (Node.js runtime only)
      authorize: async () => null,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.globalRole = (user as any).globalRole;
        token.divisionRole = (user as any).divisionRole;
        token.divisionId = (user as any).divisionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).globalRole = token.globalRole;
        (session.user as any).divisionRole = token.divisionRole;
        (session.user as any).divisionId = token.divisionId;
        (session.user as any).username = session.user.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
