import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { resolveNextAuthSecret } from "@/lib/auth-secret";
import { attemptExternalLogin } from "@/lib/external-auth-login";
import type { UserRole } from "@/types/auth";

const nextAuthSecret = resolveNextAuthSecret();
const isProduction = process.env.NODE_ENV === "production";

function extractRoleFromToken(accessToken: string): UserRole {
  try {
    const segments = accessToken.split(".");
    if (segments.length < 2) return "STUDENT";
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")) as Record<string, unknown>;
    const roleCandidate =
      payload.role ??
      payload.userRole ??
      payload["https://schemas.elevate.dev/role"] ??
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const normalized = String(roleCandidate ?? "STUDENT").toUpperCase();
    if (normalized === "ADMIN" || normalized === "SUPER_ADMIN") {
      return normalized;
    }
    return "STUDENT";
  } catch {
    return "STUDENT";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const result = await attemptExternalLogin({ identifier: email, password });

        if (!result.ok) {
          throw new Error(result.message);
        }

        const userRole = extractRoleFromToken(result.token);

        return {
          id: email,
          email,
          accessToken: result.token,
          role: userRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  secret: nextAuthSecret,
};