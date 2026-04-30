const DEV_FALLBACK_NEXTAUTH_SECRET =
  "local-dev-nextauth-secret-min-32-chars!!";

/**
 * Same secret must be used in NextAuth route (`authOptions.secret`) and in
 * `next-auth/middleware` (`options.secret`); middleware does not read `authOptions`.
 * Production: set NEXTAUTH_SECRET or AUTH_SECRET — no fallback.
 */
export function resolveNextAuthSecret(): string | undefined {
  const fromEnv =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_NEXTAUTH_SECRET;
  }
  return undefined;
}
